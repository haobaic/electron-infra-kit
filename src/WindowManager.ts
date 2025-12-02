import { BrowserWindow, shell, BrowserWindowConstructorOptions } from 'electron'
import WindowEvents from './WindowEvents'

export interface WindowManagerConfig {
  defaultConfig?: BrowserWindowConstructorOptions
  isDevelopment?: boolean
  isLinux?: boolean
}

export default class WindowManager extends WindowEvents {
  protected config: WindowManagerConfig
  private ready: boolean = false

  constructor(config: WindowManagerConfig = {}) {
    super()
    this.config = config
  }

  create(
    config?: BrowserWindowConstructorOptions & {
      name?: string
      windowId?: string
      [key: string]: any
    }
  ): string {
    if (
      (config?.name && this.hasByName(config?.name)) ||
      (config?.windowId && this.hasById(config?.windowId))
    ) {
      return this.getMainWindowId()!
    }

    const newWindow = this.createBrowserWindow(config)
    const windowId = this.createWindow(newWindow, config)

    this.configureWindowBehavior(newWindow, windowId)

    return windowId
  }

  private getMainWindowId(): string | undefined {
    return this.mainWindow ? this.getWindowId(this.mainWindow) : undefined
  }

  protected createBrowserWindow(
    config?: BrowserWindowConstructorOptions
  ): BrowserWindow {
    const defaultConfig = this.getDefaultWindowConfig()
    return new BrowserWindow({ ...defaultConfig, ...config })
  }

  protected getDefaultWindowConfig(): BrowserWindowConstructorOptions {
     return this.config.defaultConfig || {
       width: 800,
       height: 600,
       show: false,
       webPreferences: {
         nodeIntegration: true,
         contextIsolation: false
       }
     }
  }

  protected configureWindowBehavior(
    window: BrowserWindow,
    windowId: string
  ): void {
    if (this.config.isDevelopment) {
      this.openDevTools(windowId)
    }

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    window.once('ready-to-show', () => this.readyToShow(window))
  }

  readyToShow(window: BrowserWindow): void {
    this.ready = true
    this.setMovable(window)
  }

  get isReady(): boolean {
    return this.ready
  }
  set isReady(value: boolean) {
    this.ready = value
  }
}
