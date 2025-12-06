import { BrowserWindow } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import Logger  from '@/logger'

/**
 * WindowStore - Window state management class
 * WindowStore - 窗口状态管理类
 *
 * Manages the lifecycle and state of Electron windows including:
 * 管理 Electron 窗口的生命周期和状态，包括：
 * - Window instance tracking (窗口实例追踪)
 * - Window ID and Name mapping (窗口 ID 和名称映射)
 * - Main window management (主窗口管理)
 *
 * Window naming convention / 窗口命名规范:
 * - windowId: UUID format unique identifier (UUID 格式的唯一标识符)
 * - windowName: Semantic name (e.g., "main-frame", "setting-window") (语义化名称)
 *
 * @class
 */
export default class WindowStore {
  /**
   * Maximum number of windows allowed
   * 允许的最大窗口数量
   * @private
   */
  private readonly MAX_WINDOWS = 50

  /**
   * Logger instance for internal logging
   * 内部日志记录器实例
   * @protected
   */
  protected logger: Logger

  /**
   * Map of window ID to BrowserWindow instance
   * 窗口 ID 到 BrowserWindow 实例的映射
   * @protected
   */
  protected windows: Map<string, BrowserWindow> = new Map()

  /**
   * Map of window name to window ID
   * 窗口名称到窗口 ID 的映射
   * @protected
   */
  protected windowNames: Map<string, string> = new Map()

  /**
   * Map of window ID to window name (Reverse index)
   * 窗口 ID 到窗口名称的映射（反向索引）
   * @protected
   */
  protected windowIds: Map<string, string> = new Map()

  /**
   * Map of BrowserWindow instance to window ID
   * BrowserWindow 实例到窗口 ID 的映射
   * @protected
   */
  protected windowInstanceIds: Map<BrowserWindow, string> = new Map()

  /**
   * The main window instance reference
   * 主窗口实例引用
   * @protected
   */
  protected _mainWindow: BrowserWindow | null = null

  /**
   * Creates an instance of WindowStore
   * 创建 WindowStore 实例
   */
  constructor() {
    this.logger = new Logger('WindowStore')
  }

  /**
   * Gets the main window instance
   * 获取主窗口实例
   * @returns The main BrowserWindow instance or null (主窗口实例或 null)
   */
  public get mainWindow(): BrowserWindow | null {
    return this._mainWindow
  }

  /**
   * Sets the main window instance
   * 设置主窗口实例
   * @param window - The BrowserWindow instance to set as main (要设置为主窗口的实例)
   */
  protected set mainWindow(window: BrowserWindow | null) {
    this._mainWindow = window
  }

  /**
   * Creates and registers a new window
   * 创建并注册新窗口
   *
   * @param window - The BrowserWindow instance to register (要注册的窗口实例)
   * @param config - Optional configuration including name and windowId (可选配置，包含名称和 ID)
   * @returns The unique window ID (唯一窗口 ID)
   * @throws Error if maximum window limit is reached (如果达到最大窗口限制则抛出错误)
   */
  createWindow(
    window: BrowserWindow,
    config?: { name?: string; windowId?: string }
  ): string {
    // Check window limit / 检查窗口限制
    if (this.windows.size >= this.MAX_WINDOWS) {
      const error = new Error(
        `Maximum window limit (${this.MAX_WINDOWS}) reached`
      )
      this.logger.error(error.message)
      throw error
    }

    const windowId = config?.windowId || uuidv4()
    let windowName = config?.name || `window-${windowId}`

    // Validate window name / 验证窗口名称
    try {
      windowName = this.validateWindowName(windowName)
    } catch {
      this.logger.warn(
        `Window name "${windowName}" already exists, generating unique name`
      )
      windowName = `${windowName}-${Date.now()}`
    }

    this.registerWindow(windowId, windowName, window)
    return windowId
  }

  /**
   * Gets the total number of managed windows
   * 获取受管窗口的总数
   * @returns The count of windows (窗口数量)
   */
  getWindowCount(): number {
    return this.windows.size
  }

  /**
   * Gets all window IDs
   * 获取所有窗口 ID
   * @returns Array of window IDs (窗口 ID 数组)
   */
  getAllWindowKeys(): string[] {
    return Array.from(this.windows.keys())
  }

  /**
   * Gets all BrowserWindow instances
   * 获取所有 BrowserWindow 实例
   * @returns Array of BrowserWindow instances (BrowserWindow 实例数组)
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values())
  }

  /**
   * Gets the map of window names to IDs
   * 获取窗口名称到 ID 的映射
   * @returns Map of window names to IDs (窗口名称到 ID 的映射)
   */
  getWindowNames(): Map<string, string> {
    return this.windowNames
  }

  /**
   * Gets the window name by its ID
   * 根据 ID 获取窗口名称
   * @param windowId - The unique window ID (唯一窗口 ID)
   * @returns The window name or undefined (窗口名称或 undefined)
   */
  getNameByWindowId(windowId: string): string | undefined {
    return this.windowIds.get(windowId)
  }

  /**
   * Gets a target window by ID or name
   * 根据 ID 或名称获取目标窗口
   *
   * If no argument is provided, returns the current focused window or main window.
   * 如果未提供参数，则返回当前聚焦窗口或主窗口。
   *
   * @param windowId - Optional window ID or name (可选的窗口 ID 或名称)
   * @returns The BrowserWindow instance or undefined (BrowserWindow 实例或 undefined)
   */
  getTargetWindow(windowId?: string): BrowserWindow | undefined {
    if (!windowId) {
      return this.getCurrentWindow()
    }

    // Check if it's an ID / 检查是否为 ID
    const windowById = this.getWindowById(windowId)
    if (windowById) return windowById

    // Check if it's a name / 检查是否为名称
    return this.getWindowByName(windowId)
  }

  /**
   * Gets the current focused window or main window
   * 获取当前聚焦窗口或主窗口
   * @returns The BrowserWindow instance or undefined (BrowserWindow 实例或 undefined)
   */
  getCurrentWindow(): BrowserWindow | undefined {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow && !focusedWindow.isDestroyed()) return focusedWindow
    return this._mainWindow ?? undefined
  }

  /**
   * Gets a window ID by its name
   * 根据名称获取窗口 ID
   * @param name - The window name (窗口名称)
   * @returns The window ID or undefined (窗口 ID 或 undefined)
   */
  getWindowByNameId(name: string): string | undefined {
    const windowId = this.windowNames.get(name)
    return windowId ? windowId : undefined
  }

  /**
   * Gets a window instance by its name
   * 根据名称获取窗口实例
   * @param name - The window name (窗口名称)
   * @returns The BrowserWindow instance or undefined (BrowserWindow 实例或 undefined)
   */
  getWindowByName(name: string): BrowserWindow | undefined {
    const windowId = this.getWindowByNameId(name)
    return windowId ? this.windows.get(windowId) : undefined
  }

  /**
   * Checks if a window exists by name
   * 检查指定名称的窗口是否存在
   * @param proposedName - The name to check (要检查的名称)
   * @returns True if exists, false otherwise (如果存在返回 true，否则返回 false)
   */
  hasByName(proposedName: string): boolean {
    return this.windowNames.has(proposedName)
  }

  /**
   * Deletes a window record by name
   * 根据名称删除窗口记录
   * @param proposedName - The window name (窗口名称)
   * @returns True if deleted (如果删除成功返回 true)
   */
  deleteByName(proposedName: string): boolean {
    return this.windowNames.delete(proposedName)
  }

  /**
   * Gets a window instance by ID
   * 根据 ID 获取窗口实例
   * @param windowId - The window ID (窗口 ID)
   * @returns The BrowserWindow instance or undefined (BrowserWindow 实例或 undefined)
   */
  getWindowById(windowId: string): BrowserWindow | undefined {
    return this.windows.get(windowId)
  }

  /**
   * Checks if a window exists by ID
   * 检查指定 ID 的窗口是否存在
   * @param windowId - The window ID (窗口 ID)
   * @returns True if exists (如果存在返回 true)
   */
  hasById(windowId: string): boolean {
    return this.windows.has(windowId)
  }

  /**
   * Deletes a window record by ID
   * 根据 ID 删除窗口记录
   * @param windowId - The window ID (窗口 ID)
   * @returns True if deleted (如果删除成功返回 true)
   */
  deleteById(windowId: string): boolean {
    return this.windows.delete(windowId)
  }

  /**
   * Gets the window ID for a given BrowserWindow instance
   * 获取给定 BrowserWindow 实例的窗口 ID
   * @param window - The BrowserWindow instance (BrowserWindow 实例)
   * @returns The window ID or undefined (窗口 ID 或 undefined)
   */
  getWindowId(window: BrowserWindow): string | undefined {
    return this.windowInstanceIds.get(window)
  }

  /**
   * Gets the main window
   * 获取主窗口
   * @returns The main BrowserWindow instance or null (主窗口实例或 null)
   */
  getMainWindow(): BrowserWindow | null {
    return this._mainWindow
  }

  /**
   * Updates a window's name
   * 更新窗口名称
   * @param windowId - The window ID (窗口 ID)
   * @param newName - The new name for the window (窗口新名称)
   */
  updateWindowName(windowId: string, newName: string): void {
    const currentName = this.getNameByWindowId(windowId)
    if (currentName) this.windowNames.delete(currentName)
    this.windowNames.set(newName, windowId)
    this.windowIds.set(windowId, newName)
  }

  /**
   * Removes and closes a window
   * 移除并关闭窗口
   * @param windowId - The window ID (窗口 ID)
   */
  removeWindow(windowId: string): void {
    const name = this.getNameByWindowId(windowId)
    if (name) this.windowNames.delete(name)

    const window = this.windows.get(windowId)
    if (window && !window.isDestroyed()) {
      try {
        // Clear reverse index / 清理反向索引
        this.windowInstanceIds.delete(window)

        window.close()
        // destroy is usually called automatically after close, but keep for safety
        // destroy 通常在 close 后自动调用，但为了安全起见保留
        if (!window.isDestroyed()) {
          window.destroy()
        }
      } catch (error) {
        this.logger.error(`Failed to remove window ${windowId}: ${error}`)
      } finally {
        this.windows.delete(windowId)
        this.windowIds.delete(windowId)
        if (this._mainWindow === window) {
          this._mainWindow = null
        }
      }
    }
  }

  /**
   * Validates if a window name is unique
   * 验证窗口名称是否唯一
   * @param proposedName - The name to validate (要验证的名称)
   * @returns The valid name (有效的名称)
   * @throws Error if name already exists (如果名称已存在则抛出错误)
   */
  private validateWindowName(proposedName: string): string {
    if (this.hasByName(proposedName)) {
      throw new Error(`Window name "${proposedName}" already exists`)
    }
    return proposedName
  }

  /**
   * Registers a window in the store
   * 在存储中注册窗口
   * @param id - Window ID (窗口 ID)
   * @param name - Window name (窗口名称)
   * @param window - BrowserWindow instance (BrowserWindow 实例)
   */
  private registerWindow(
    id: string,
    name: string,
    window: BrowserWindow
  ): void {
    this.windows.set(id, window)
    this.windowNames.set(name, id)
    // Maintain reverse index / 维护反向索引
    this.windowIds.set(id, name)
    this.windowInstanceIds.set(window, id)
    
    if (!this._mainWindow) {
      this._mainWindow = window
    }
  }
}
