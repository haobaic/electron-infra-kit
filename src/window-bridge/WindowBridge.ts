import {
  MessageChannelMain,
  MessagePortMain,
  BrowserWindow,
  ipcMain
} from 'electron'
import { EventEmitter } from 'events'
import Logger  from '@/logger'
import type {
  DataChangeEvent,
  FieldPermission,
  DataStoreItem,
  WindowBridgeHandler,
  BridgeMessageHandler
} from './window-bridge.type'

/**
 * WindowBridge - Multi-window state synchronization and communication bridge
 * WindowBridge - 多窗口状态同步与通信桥梁
 *
 * Design patterns / 设计模式:
 * - Shared State (Instance-based): Singleton instance holds shared state (单例实例持有共享状态)
 * - MessagePort Broadcasting: Efficient inter-window communication (MessagePort 广播：高效的窗口间通信)
 * - Permission Control: Field-level + Window-level dual permission (权限控制：字段级 + 窗口级双重权限)
 * - Message Proxy: Unified communication interface (消息代理：统一的通信接口)
 */
export default class WindowBridge extends EventEmitter {
  private static instance: WindowBridge
  private eventName: string = 'window-state-changed'
  protected logger: Logger

  // Instance properties for state management (Instance-based for testability)
  // 实例属性用于状态管理（基于实例以提高可测试性）
  protected dataStore: Map<string, DataStoreItem> = new Map()
  protected windowPorts: Map<string, MessagePortMain> = new Map()
  // Message handlers collection
  // 消息处理器集合
  protected messageHandlers: Map<string, BridgeMessageHandler> = new Map()

  private constructor(eventName: string = 'window-state-changed') {
    super()
    this.eventName = eventName
    this.logger = new Logger('WindowBridge')
    this.registerDefaultHandlers()
  }

  /**
   * Get singleton instance
   * 获取单例实例
   * @param eventName - Custom event name (自定义事件名称)
   * @returns WindowBridge instance (WindowBridge 实例)
   */
  static getInstance(eventName?: string): WindowBridge {
    if (!WindowBridge.instance) {
      WindowBridge.instance = new WindowBridge(eventName)
    }
    return WindowBridge.instance
  }

  /**
   * Create and register MessagePort for a window
   * 创建并注册窗口的 MessagePort
   * @param windowId - Window ID (窗口 ID)
   * @param window - BrowserWindow instance (BrowserWindow 实例)
   */
  registerWindowPort(windowId: string, window: BrowserWindow): void {
    // Clean up existing port if any (e.g. during reload)
    // 清理现有的端口（例如在重新加载期间）
    this.unregisterWindowPort(windowId)

    const { port1, port2 } = new MessageChannelMain()

    // port1 is kept in main process for sending messages
    // port1 保存在主进程，用于发送消息
    this.windowPorts.set(windowId, port1)

    // Internal helper to inject port
    // 内部辅助函数用于注入端口
    const injectPort = () => {
      try {
        window.webContents.postMessage('window-bridge-port', null, [port2])
      } catch (error) {
        this.logger.error(
          `Failed to post message to window ${windowId}: ${error}`
        )
      }
    }

    // port2 is sent to renderer process
    // port2 发送给渲染进程
    if (window.webContents.isLoading()) {
      window.webContents.once('did-finish-load', () => {
        injectPort()
      })
    } else {
      injectPort()
    }
  }

  /**
   * Unregister MessagePort for a window
   * 注销窗口的 MessagePort
   * @param windowId - Window ID (窗口 ID)
   */
  unregisterWindowPort(windowId: string): void {
    const port = this.windowPorts.get(windowId)
    if (port) {
      try {
        port.close()
      } catch (error) {
        this.logger.warn(`Failed to close port for window ${windowId}: ${error}`)
      }
      this.windowPorts.delete(windowId)
    }
  }

  /**
   * Register a single event handler
   * 注册单个事件处理器
   * @param handler - Event handler (事件处理器)
   */
  registerHandler(handler: WindowBridgeHandler): void {
    this.on(handler.eventName, handler.callback)
  }

  /**
   * Batch register event handlers
   * 批量注册事件处理器
   * @param handlers - Array of event handlers (事件处理器数组)
   */
  registerHandlers(handlers: WindowBridgeHandler[]): void {
    handlers.forEach((handler) => this.registerHandler(handler))
  }

  /**
   * Unregister a single event handler
   * 注销单个事件处理器
   * @param handler - Event handler (事件处理器)
   */
  unregisterHandler(handler: WindowBridgeHandler): void {
    this.removeListener(handler.eventName, handler.callback)
  }

  /**
   * Batch unregister event handlers
   * 批量注销事件处理器
   * @param handlers - Array of event handlers (事件处理器数组)
   */
  unregisterHandlers(handlers: WindowBridgeHandler[]): void {
    handlers.forEach((handler) => this.unregisterHandler(handler))
  }

  /**
   * Get data
   * 获取数据
   * @param key - Data key, returns all data if not provided (数据键，不传则返回所有数据)
   * @returns Data value or all data (数据值或所有数据)
   */
  getData(key?: string): any {
    if (key) {
      return this.dataStore.get(key)?.value
    }

    const result: Record<string, any> = {}
    this.dataStore.forEach((item, k) => {
      result[k] = item.value
    })
    return result
  }

  /**
   * Set data (with permission check)
   * 设置数据（带权限验证）
   * @param key - Data key (数据键)
   * @param value - Data value (数据值)
   * @param windowId - Operation window ID (操作窗口 ID)
   * @param eventName - Optional event name (可选的事件名称)
   * @returns Result object with success flag and error message (包含成功标志和错误消息的结果对象)
   */
  setData(
    key: string,
    value: any,
    windowId?: string,
    eventName?: string
  ): { success: boolean; error?: string } {
    const item = this.dataStore.get(key)

    // Check readonly permission
    // 检查只读权限
    if (item?.permission?.readonly) {
      return { success: false, error: `Field "${key}" is readonly` }
    }

    // Check window-level permission
    // 检查窗口级权限
    if (item?.permission?.allowedWindows && windowId) {
      if (!item.permission.allowedWindows.includes(windowId)) {
        return {
          success: false,
          error: `Window "${windowId}" is not allowed to modify "${key}"`
        }
      }
    }

    const oldValue = item?.value
    this.dataStore.set(key, {
      value,
      permission: item?.permission
    })

    // Broadcast change
    // 广播变更
    const event: DataChangeEvent = {
      type: 'set',
      key,
      value,
      oldValue,
      windowId,
      timestamp: Date.now()
    }
    this.broadcastChange(event)
    this.emit(eventName || this.eventName, event)

    return { success: true }
  }

  /**
   * Delete data
   * 删除数据
   * @param key - Data key (数据键)
   * @param windowId - Operation window ID (操作窗口 ID)
   * @param eventName - Optional event name (可选的事件名称)
   * @returns Result object with success flag and error message (包含成功标志和错误消息的结果对象)
   */
  deleteData(
    key: string,
    windowId?: string,
    eventName?: string
  ): { success: boolean; error?: string } {
    const item = this.dataStore.get(key)

    if (item?.permission?.readonly) {
      return { success: false, error: `Field "${key}" is readonly` }
    }

    if (item?.permission?.allowedWindows && windowId) {
      if (!item.permission.allowedWindows.includes(windowId)) {
        return {
          success: false,
          error: `Window "${windowId}" is not allowed to delete "${key}"`
        }
      }
    }

    const oldValue = item?.value
    this.dataStore.delete(key)

    const event: DataChangeEvent = {
      type: 'delete',
      key,
      oldValue,
      windowId,
      timestamp: Date.now()
    }
    this.broadcastChange(event)
    this.emit(eventName || this.eventName, event)

    return { success: true }
  }

  /**
   * Set field permission
   * 设置字段权限
   * @param key - Data key (数据键)
   * @param permission - Permission object (权限对象)
   */
  setFieldPermission(key: string, permission: FieldPermission): void {
    const item = this.dataStore.get(key)
    if (item) {
      item.permission = permission
    } else {
      this.dataStore.set(key, { value: undefined, permission })
    }
  }

  /**
   * Get registered windows list (for debugging)
   * 获取已注册的窗口列表（调试用）
   * @returns Array of registered window IDs (已注册的窗口 ID 数组)
   */
  getRegisteredWindows(): string[] {
    return Array.from(this.windowPorts.keys())
  }

  /**
   * Register message handler
   * 注册消息处理器
   * @param handler - Bridge message handler (桥接消息处理器)
   */
  registerMessageHandler(handler: BridgeMessageHandler): void {
    this.messageHandlers.set(handler.name, handler)
  }

  /**
   * Register default handlers
   * 注册默认处理器
   */
  private registerDefaultHandlers(): void {
    this.registerMessageHandler({
      name: 'get',
      callback: (bridge, { key } = {}) => bridge.getData(key)
    })

    this.registerMessageHandler({
      name: 'set',
      callback: (bridge, { key, value, windowId, eventName }) =>
        bridge.setData(key, value, windowId, eventName)
    })

    this.registerMessageHandler({
      name: 'delete',
      callback: (bridge, { key, windowId, eventName }) =>
        bridge.deleteData(key, windowId, eventName)
    })

    this.registerMessageHandler({
      name: 'set-permission',
      callback: (bridge, { key, permission }) =>
        bridge.setFieldPermission(key, permission)
    })
  }

  /**
   * Handle message
   * 处理消息
   * @param name - Message name (消息名称)
   * @param data - Message data (消息数据)
   * @returns Result of handler (处理器结果)
   */
  handleMessage(name: string, data: any): any {
    const handler = this.messageHandlers.get(name)
    if (handler) {
      return handler.callback(this, data)
    }
    this.logger.warn(`WindowBridge: No handler for message "${name}"`)
    return null
  }

  /**
   * Initialize communication listener (optional)
   * 初始化通信监听器（可选）
   *
   * Allows renderer process to read/write data directly via unified channel.
   * 允许渲染进程通过统一通道直接读写数据。
   */
  initializeListener(): void {
    // Unified channel, optimize communication
    // 统一通道，优化通信方式
    ipcMain.handle('window-bridge-invoke', (_, { name, data }) =>
      this.handleMessage(name, data)
    )
  }

  /**
   * Broadcast changes to all windows via MessagePort
   * 通过 MessagePort 广播变更到所有窗口
   * @param event - Data change event (数据变更事件)
   */
  private broadcastChange(event: DataChangeEvent): void {
    const message = JSON.stringify(event)

    this.windowPorts.forEach((port, windowId) => {
      try {
        port.postMessage(message)
      } catch (error) {
        this.logger.error(
          `Failed to broadcast to window ${windowId}: ${error}`
        )
      }
    })
  }
}
