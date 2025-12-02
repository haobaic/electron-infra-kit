import { BrowserWindow, app, screen } from 'electron'
import WindowStore from './WindowStore'

/**
 * WindowEvents 类继承自 WindowStore，用于处理与窗口相关的事件和操作
 */
export default class WindowEvents extends WindowStore {
  // 辅助方法 - 获取有效窗口（包含状态检查）
  /**
   * 获取有效的窗口对象，如果窗口不存在或已销毁则返回 null
   * @param windowId 窗口ID
   * @returns 有效的窗口对象或 null
   */
  private getValidWindow(windowId?: string): BrowserWindow | null {
    const window = this.getTargetWindow(windowId)
    if (!window || window.isDestroyed()) {
      console.warn(`Window ${windowId || 'current'} not found or destroyed`)
      return null
    }
    return window
  }

  // 窗口显示与隐藏
  /**
   * 显示窗口
   * @param window 窗口对象
   * @param windowId 窗口ID，可选
   */
  show(window: BrowserWindow, windowId?: string): void {
    window.show()
    if (windowId) this.setSkipTaskbar(windowId, false)
  }

  /**
   * 隐藏指定窗口
   * @param windowId 窗口ID
   */
  hide(windowId: string): void {
    this.getTargetWindow(windowId)?.hide()
    this.setSkipTaskbar(windowId, true)
  }

  // 窗口状态检查
  /**
   * 检查指定窗口是否已被销毁
   * @param windowId 窗口ID
   * @returns 窗口是否已被销毁
   */
  isDestroyed(windowId: string): boolean {
    const window = this.getTargetWindow(windowId)
    return !window || window.isDestroyed()
  }

  /**
   * 检查指定窗口是否可见
   * @param windowId 窗口ID
   * @returns 窗口是否可见
   */
  isVisible(windowId: string): boolean {
    const window = this.getValidWindow(windowId)
    return window?.isVisible() || false
  }

  /**
   * 检查指定窗口是否已被最小化
   * @param windowId 窗口ID
   * @returns 窗口是否已被最小化
   */
  isMinimized(windowId: string): boolean {
    return this.getTargetWindow(windowId)?.isMinimized() || false
  }

  /**
   * 检查指定窗口是否已被最大化
   * @param windowId 窗口ID
   * @returns 窗口是否已被最大化
   */
  isMaximized(windowId: string): boolean {
    return this.getTargetWindow(windowId)?.isMaximized() || false
  }

  /**
   * 检查指定窗口是否处于全屏状态
   * @param windowId 窗口ID
   * @returns 窗口是否处于全屏状态
   */
  fullScreenState(windowId: string): boolean {
    return this.getTargetWindow(windowId)?.isFullScreen() || false
  }

  // 窗口操作
  /**
   * 最小化指定窗口
   * @param windowId 窗口ID，如果不传则默认最小化当前窗口
   */
  minimize(windowId?: string): void {
    this.getTargetWindow(windowId)?.minimize()
  }

  /**
   * 恢复指定窗口
   * @param windowId 窗口ID
   */
  restore(windowId: string): void {
    this.getValidWindow(windowId)?.restore()
  }

  /**
   * 最大化指定窗口
   * @param windowId 窗口ID
   */
  maximize(windowId: string): void {
    this.getValidWindow(windowId)?.maximize()
  }

  /**
   * 恢复指定窗口的大小
   * @param windowId 窗口ID
   */
  unmaximize(windowId: string): void {
    this.getValidWindow(windowId)?.unmaximize()
  }

  /**
   * 切换指定窗口的全屏状态
   * @param windowId 窗口ID
   */
  fullScreen(windowId: string): void {
    const window = this.getValidWindow(windowId)
    const isFullScreen = window?.isFullScreen() || false
    window?.setFullScreen(!isFullScreen)
  }

  /**
   * 给指定窗口设置焦点
   * @param windowId 窗口ID
   */
  focus(windowId: string): void {
    this.getValidWindow(windowId)?.focus()
  }

  /**
   * 设置窗口是否可移动
   * @param window 窗口对象
   */
  setMovable(window: BrowserWindow): void {
    window.setMovable(true)
  }

  /**
   * 关闭指定窗口
   * @param windowId 窗口ID
   */
  winClose(windowId: string): void {
    this.removeWindow(windowId)
    this.quit()
  }

  // 开发者工具操作
  /**
   * 打开指定窗口的开发者工具
   * @param windowId 窗口ID
   */
  openDevTools(windowId: string): void {
    this.getTargetWindow(windowId)?.webContents.openDevTools()
  }

  /**
   * 检查指定窗口的开发者工具是否已打开
   * @param windowId 窗口ID
   * @returns 开发者工具是否已打开
   */
  isDevToolsOpened(windowId: string): boolean {
    return (
      this.getTargetWindow(windowId)?.webContents.isDevToolsOpened() || false
    )
  }

  /**
   * 关闭指定窗口的开发者工具
   * @param windowId 窗口ID
   */
  closeDevTools(windowId: string): void {
    this.getTargetWindow(windowId)?.webContents.closeDevTools()
  }

  // 应用程序控制
  /**
   * 退出应用程序
   */
  quit(): void {
    app.quit()
  }

  // 窗口大小与位置操作
  /**
   * 获取主显示器的工作区域大小
   * @returns 包含宽度和高度的对象
   */
  getWindowSize(): { width: number; height: number } {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    return { width, height }
  }

  // 消息发送
  /**
   * 向指定窗口发送消息
   * @param windowId 窗口ID
   * @param name 消息名称
   * @param data 消息数据，可选，默认为空字符串
   */
  send(windowId: string, name: string, data: unknown = ''): void {
    return this.getTargetWindow(windowId)?.webContents.send(name, data)
  }

  // 设置窗口是否显示在任务栏上
  /**
   * 设置窗口是否显示在任务栏上
   * @param windowId 窗口ID
   * @param bool 是否显示在任务栏上
   */
  setSkipTaskbar(windowId: string, bool: boolean): void {
    this.getTargetWindow(windowId)?.setSkipTaskbar(bool)
  }
}
