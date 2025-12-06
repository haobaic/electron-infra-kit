import { BrowserWindow, app, screen } from 'electron'
import WindowStore from './WindowStore'

/**
 * WindowEvents class extends WindowStore to handle window-related events and operations
 * WindowEvents 类继承自 WindowStore，用于处理与窗口相关的事件和操作
 */
export default class WindowEvents extends WindowStore {
  // Helper methods - Get valid window (with status check)
  // 辅助方法 - 获取有效窗口（包含状态检查）
  /**
   * Get a valid window object, returns null if window does not exist or is destroyed
   * 获取有效的窗口对象，如果窗口不存在或已销毁则返回 null
   * @param windowId - Window ID (窗口ID)
   * @returns Valid window object or null (有效的窗口对象或 null)
   */
  private getValidWindow(windowId?: string): BrowserWindow | null {
    const window = this.getTargetWindow(windowId)
    if (!window || window.isDestroyed()) {
      this.logger.warn(`Window ${windowId || 'current'} not found or destroyed`)
      return null
    }
    return window
  }

  // Window show/hide
  // 窗口显示与隐藏
  /**
   * Show window
   * 显示窗口
   * @param window - Window object (窗口对象)
   * @param windowId - Window ID, optional (窗口ID，可选)
   */
  show(window: BrowserWindow, windowId?: string): void {
    window.show()
    if (windowId) this.setSkipTaskbar(windowId, false)
  }

  /**
   * Hide specified window
   * 隐藏指定窗口
   * @param windowId - Window ID (窗口ID)
   */
  hide(windowId: string): void {
    this.getTargetWindow(windowId)?.hide()
    this.setSkipTaskbar(windowId, true)
  }

  // Window status check
  // 窗口状态检查
  /**
   * Check if specified window is destroyed
   * 检查指定窗口是否已被销毁
   * @param windowId - Window ID (窗口ID)
   * @returns Whether window is destroyed (窗口是否已被销毁)
   */
  isDestroyed(windowId: string): boolean {
    const window = this.getTargetWindow(windowId)
    return !window || window.isDestroyed()
  }

  /**
   * Check if specified window is visible
   * 检查指定窗口是否可见
   * @param windowId - Window ID (窗口ID)
   * @returns Whether window is visible (窗口是否可见)
   */
  isVisible(windowId: string): boolean {
    const window = this.getValidWindow(windowId)
    return window?.isVisible() || false
  }

  /**
   * Check if specified window is minimized
   * 检查指定窗口是否已被最小化
   * @param windowId - Window ID (窗口ID)
   * @returns Whether window is minimized (窗口是否已被最小化)
   */
  isMinimized(windowId: string): boolean {
    return this.getTargetWindow(windowId)?.isMinimized() || false
  }

  /**
   * Check if specified window is maximized
   * 检查指定窗口是否已被最大化
   * @param windowId - Window ID (窗口ID)
   * @returns Whether window is maximized (窗口是否已被最大化)
   */
  isMaximized(windowId: string): boolean {
    return this.getTargetWindow(windowId)?.isMaximized() || false
  }

  /**
   * Check if specified window is in full screen mode
   * 检查指定窗口是否处于全屏状态
   * @param windowId - Window ID (窗口ID)
   * @returns Whether window is in full screen mode (窗口是否处于全屏状态)
   */
  fullScreenState(windowId: string): boolean {
    return this.getTargetWindow(windowId)?.isFullScreen() || false
  }

  // Window operations
  // 窗口操作
  /**
   * Minimize specified window
   * 最小化指定窗口
   * @param windowId - Window ID, defaults to current window if not provided (窗口ID，如果不传则默认最小化当前窗口)
   */
  minimize(windowId?: string): void {
    this.getTargetWindow(windowId)?.minimize()
  }

  /**
   * Restore specified window
   * 恢复指定窗口
   * @param windowId - Window ID (窗口ID)
   */
  restore(windowId: string): void {
    this.getValidWindow(windowId)?.restore()
  }

  /**
   * Maximize specified window
   * 最大化指定窗口
   * @param windowId - Window ID (窗口ID)
   */
  maximize(windowId: string): void {
    this.getValidWindow(windowId)?.maximize()
  }

  /**
   * Unmaximize specified window (restore size)
   * 恢复指定窗口的大小
   * @param windowId - Window ID (窗口ID)
   */
  unmaximize(windowId: string): void {
    this.getValidWindow(windowId)?.unmaximize()
  }

  /**
   * Toggle full screen mode for specified window
   * 切换指定窗口的全屏状态
   * @param windowId - Window ID (窗口ID)
   */
  fullScreen(windowId: string): void {
    const window = this.getValidWindow(windowId)
    const isFullScreen = window?.isFullScreen() || false
    window?.setFullScreen(!isFullScreen)
  }

  /**
   * Focus specified window
   * 给指定窗口设置焦点
   * @param windowId - Window ID (窗口ID)
   */
  focus(windowId: string): void {
    this.getValidWindow(windowId)?.focus()
  }

  /**
   * Set window movability
   * 设置窗口是否可移动
   * @param window - Window object (窗口对象)
   */
  setMovable(window: BrowserWindow): void {
    window.setMovable(true)
  }

  /**
   * Close specified window
   * 关闭指定窗口
   * @param windowId - Window ID (窗口ID)
   */
  winClose(windowId: string): void {
    this.removeWindow(windowId)
    this.quit()
  }

  // DevTools operations
  // 开发者工具操作
  /**
   * Open DevTools for specified window
   * 打开指定窗口的开发者工具
   * @param windowId - Window ID (窗口ID)
   */
  openDevTools(windowId: string): void {
    this.getTargetWindow(windowId)?.webContents.openDevTools()
  }

  /**
   * Check if DevTools is opened for specified window
   * 检查指定窗口的开发者工具是否已打开
   * @param windowId - Window ID (窗口ID)
   * @returns Whether DevTools is opened (开发者工具是否已打开)
   */
  isDevToolsOpened(windowId: string): boolean {
    return (
      this.getTargetWindow(windowId)?.webContents.isDevToolsOpened() || false
    )
  }

  /**
   * Close DevTools for specified window
   * 关闭指定窗口的开发者工具
   * @param windowId - Window ID (窗口ID)
   */
  closeDevTools(windowId: string): void {
    this.getTargetWindow(windowId)?.webContents.closeDevTools()
  }

  // Application control
  // 应用程序控制
  /**
   * Quit application
   * 退出应用程序
   */
  quit(): void {
    app.quit()
  }

  // Window size and position operations
  // 窗口大小与位置操作
  /**
   * Get work area size of primary display
   * 获取主显示器的工作区域大小
   * @returns Object containing width and height (包含宽度和高度的对象)
   */
  getWindowSize(): { width: number; height: number } {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    return { width, height }
  }

  // Message sending
  // 消息发送
  /**
   * Send message to specified window
   * 向指定窗口发送消息
   * @param windowId - Window ID (窗口ID)
   * @param name - Message name (消息名称)
   * @param data - Message data, optional, default is empty string (消息数据，可选，默认为空字符串)
   */
  send(windowId: string, name: string, data: unknown = ''): void {
    return this.getTargetWindow(windowId)?.webContents.send(name, data)
  }

  // Set skip taskbar
  // 设置窗口是否显示在任务栏上
  /**
   * Set whether window should skip taskbar
   * 设置窗口是否显示在任务栏上
   * @param windowId - Window ID (窗口ID)
   * @param bool - Whether to skip taskbar (是否显示在任务栏上)
   */
  setSkipTaskbar(windowId: string, bool: boolean): void {
    this.getTargetWindow(windowId)?.setSkipTaskbar(bool)
  }
}
