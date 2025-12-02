import { delay } from '../utils'
import { BrowserWindow } from 'electron'

export interface WindowManagerApi {
  window: {
    hasById(id: string): boolean
    isDestroyed(id: string): boolean
    deleteByName(name: string): boolean
    deleteById(id: string): boolean
    getTargetWindow(id: string): BrowserWindow | undefined
    removeWindow(id: string): void
    show(window: BrowserWindow, id: string): void
  }
}

interface Frame {
  create(config?: any): string
}

interface FrameConstructor {
  new(): Frame
}

// 新增通用窗口创建类
export default class WindowCreator<T = any> {
  private api: WindowManagerApi
  private data: { data: T & { winId?: string } }
  private winId: string
  private FrameClass: FrameConstructor
  private extraOptions?: (data: T) => object

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
  }

  private createWindow(): { winId: string; isNew: boolean } {
    let isNew = false
    if (!this.api.window.hasById(this.winId)) {
      const windowInstance = new this.FrameClass()
      const options = this.winId
        ? {
          windowId: this.winId,
          ...(this.extraOptions?.(this.data.data) || {})
        }
        : this.data.data
      this.winId = windowInstance.create(options)
      isNew = true
    }
    return { winId: this.winId, isNew }
  }

  private showWindow(winId: string, isNew: boolean, retryCount = 0): void {
    if (this.api.window?.isDestroyed(winId)) {
      // 防止无限递归，限制重试次数
      if (retryCount >= 3) {
        console.error(
          `Failed to create and show window ${winId} after 3 retries`
        )
        return
      }

      this.api.window?.deleteByName(`window-${winId}`)
      this.api.window?.deleteById(winId)
      delay(500).then(() => {
        const result = this.createWindow()
        this.showWindow(result.winId, result.isNew, retryCount + 1)
      })
    } else {
      const win = this.api.window?.getTargetWindow(winId)
      if (win) {
        if (isNew) {
          win.once('ready-to-show', () => {
            this.api.window.show(win, winId)
          })
        } else {
          this.api.window.show(win, winId)
        }
      }
    }
  }

  public createAndShow(): string {
    const { isNew } = this.createWindow()
    this.showWindow(this.winId, isNew)
    return this.winId
  }
}
