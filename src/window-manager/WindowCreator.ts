import Logger  from '@/logger'
import type { WindowManagerApi, FrameConstructor } from './window-manager.type'

/**
 * WindowCreator - Universal window creation helper class
 * WindowCreator - 通用窗口创建辅助类
 *
 * Handles window creation, restoration, display, and exception recovery.
 * 用于处理窗口创建、恢复、显示以及异常恢复逻辑。
 */
export default class WindowCreator<T = any> {
  private api: WindowManagerApi
  private data: { data: T & { winId?: string } }
  private winId: string
  private FrameClass: FrameConstructor
  private extraOptions?: (data: T) => object
  private logger: Logger

  /**
   * Constructor
   * 构造函数
   *
   * @param api - WindowManager API interface (WindowManager API 接口)
   * @param data - Data object passed to the window, including winId (传递给窗口的数据对象，包含 winId)
   * @param FrameClass - Window class constructor (窗口类构造函数)
   * @param extraOptions - Optional function to generate extra configuration (可选的额外配置生成函数)
   */
  constructor(
    api: WindowManagerApi,
    data: { data: T & { winId?: string } },
    FrameClass: FrameConstructor,
    extraOptions?: (data: T) => object
  ) {
    this.api = api
    this.data = data
    this.winId = data?.data?.winId || ''
    this.FrameClass = FrameClass
    this.extraOptions = extraOptions
    this.logger = new Logger('WindowCreator')
  }

  /**
   * Internal method: Create window
   * 内部方法：创建窗口
   *
   * Checks if window exists. If it exists but is destroyed, cleans up and recreates.
   * 检查窗口是否存在。如果存在但已销毁，则清理并重新创建。
   *
   * @returns Object containing window ID and isNew flag (包含窗口 ID 和是否为新创建标志的对象)
   */
  private createWindow(): { winId: string; isNew: boolean } {
    let isNew = false

    // Check if window exists
    // 检查窗口是否存在
    if (this.winId && this.api.window.hasById(this.winId)) {
      // If exists but destroyed, clean it up
      // 如果存在但已销毁，进行清理
      if (this.api.window.isDestroyed(this.winId)) {
        this.logger.warn(
          `Window ${this.winId} is found in store but destroyed. Cleaning up and recreating.`
        )
        // Clean up using the API which should handle both ID and Name maps if possible
        // 使用 API 清理，应该同时处理 ID 和名称映射
        this.api.window.removeWindow(this.winId)
      } else {
        // Window exists and is valid
        // 窗口存在且有效
        return { winId: this.winId, isNew: false }
      }
    }

    // Create new window instance
    // 创建新窗口实例
    const windowInstance = new this.FrameClass()
    const options = this.winId
      ? {
          windowId: this.winId,
          ...(this.extraOptions?.(this.data.data) || {})
        }
      : this.data.data

    this.winId = windowInstance.create(options)
    isNew = true

    return { winId: this.winId, isNew }
  }

  /**
   * Internal method: Show window
   * 内部方法：显示窗口
   *
   * @param winId - Window ID (窗口 ID)
   * @param isNew - Is newly created (是否为新创建)
   */
  private showWindow(winId: string, isNew: boolean): void {
    const win = this.api.window.getTargetWindow(winId)

    if (!win || win.isDestroyed()) {
      this.logger.error(
        `Failed to show window ${winId}: Window not found or destroyed`
      )
      return
    }

    if (isNew) {
      // For new windows, wait for ready-to-show to prevent flickering
      // 对于新窗口，等待 ready-to-show 事件以防止闪烁
      win.once('ready-to-show', () => {
        this.api.window.show(win, winId)
      })
    } else {
      // For existing windows, show immediately
      // 对于现有窗口，立即显示
      this.api.window.show(win, winId)
    }
  }

  /**
   * Create and show window
   * 创建并显示窗口
   *
   * If window exists, restores and focuses it. If not, creates it.
   * 如果窗口已存在则恢复并聚焦，如果不存在则创建。
   *
   * @returns Window ID (窗口 ID)
   */
  public createAndShow(): string {
    try {
      const { isNew } = this.createWindow()
      this.showWindow(this.winId, isNew)
      return this.winId
    } catch (error) {
      this.logger.error(`Failed to create and show window: ${error}`)
      throw error
    }
  }
}
