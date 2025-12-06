import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

/**
 * Window Manager API Interface
 * 窗口管理器 API 接口
 */
export interface WindowManagerApi {
  /**
   * Window operations namespace
   * 窗口操作命名空间
   */
  window: {
    /**
     * Check if window exists by ID
     * 检查指定 ID 的窗口是否存在
     */
    hasById(id: string): boolean
    /**
     * Check if window is destroyed
     * 检查窗口是否已销毁
     */
    isDestroyed(id: string): boolean
    /**
     * Delete window by name
     * 根据名称删除窗口
     */
    deleteByName(name: string): boolean
    /**
     * Delete window by ID
     * 根据 ID 删除窗口
     */
    deleteById(id: string): boolean
    /**
     * Get target window by ID
     * 获取目标窗口
     */
    getTargetWindow(id: string): BrowserWindow | undefined
    /**
     * Remove window
     * 移除窗口
     */
    removeWindow(id: string): void
    /**
     * Show window
     * 显示窗口
     */
    show(window: BrowserWindow, id: string): void
  }
}

/**
 * Window Manager Configuration Interface
 * 窗口管理器配置接口
 */
export interface WindowManagerConfig {
  /**
   * Default browser window options
   * 默认浏览器窗口选项
   */
  defaultConfig?: BrowserWindowConstructorOptions
  /**
   * Development mode flag
   * 开发模式标志
   */
  isDevelopment?: boolean
  /**
   * Linux platform flag
   * Linux 平台标志
   */
  isLinux?: boolean
  /**
   * IPC configuration
   * IPC 配置
   */
  ipc?: {
    /**
     * Whether to automatically initialize IPC on instantiation, default is true
     * 是否在实例化时自动初始化 IPC，默认为 true
     */
    autoInit?: boolean
    /**
     * Async communication channel name, default is 'renderer-to-main'
     * 异步通信频道名称，默认为 'renderer-to-main'
     */
    channel?: string
    /**
     * Sync communication channel name, default is 'renderer-to-main-sync'
     * 同步通信频道名称，默认为 'renderer-to-main-sync'
     */
    syncChannel?: string
  }
}

/**
 * Frame Interface
 * 窗口框架接口
 */
export interface Frame {
  /**
   * Create window
   * 创建窗口
   */
  create(config?: any): string
}

/**
 * Frame Constructor Interface
 * 窗口框架构造函数接口
 */
export interface FrameConstructor {
  new(): Frame
}
