import { IpcMainInvokeEvent, IpcMainEvent } from 'electron'
import IPC from '@/IPC'
import IpcBridge from '@/ipc-bridge/IpcBridge'
import { WindowManagerConfig } from './window-manager.type'

export interface IpcSetupOptions {
  config: WindowManagerConfig
  ipcBridge: IpcBridge
  currentIpcChannel?: string | null
  currentIpcSyncChannel?: string | null
  options?: { channel?: string; syncChannel?: string }
}

export interface IpcSetupResult {
  channel: string
  syncChannel: string
}

/**
 * Responsible for IPC registration logic of WindowManager
 * 负责 WindowManager 的 IPC 注册逻辑
 */
export class IpcSetup {
  /**
   * Setup IPC communication
   * 设置 IPC 通信
   * @param params - Parameter object (参数对象)
   * @returns Registered channel names (注册的频道名称)
   */
  static setup(params: IpcSetupOptions): IpcSetupResult {
    const {
      config,
      ipcBridge,
      currentIpcChannel,
      currentIpcSyncChannel,
      options
    } = params

    const channel =
      options?.channel || config.ipc?.channel || 'renderer-to-main'
    const syncChannel =
      options?.syncChannel ||
      config.ipc?.syncChannel ||
      'renderer-to-main-sync'

    // Clean up old listeners (if exist)
    // 清理旧的监听器 (如果存在)
    if (currentIpcChannel) {
      IPC.removeHandler(currentIpcChannel)
    }
    if (currentIpcSyncChannel) {
      IPC.removeListener(currentIpcSyncChannel)
    }

    IPC.handle(channel, (_: IpcMainInvokeEvent, data) => {
      return ipcBridge.handle(data)
    })

    IPC.on(syncChannel, (event: IpcMainEvent, data) => {
      const result = ipcBridge.handle(data) // Call IPC handler / 调用IPC处理函数
      event.returnValue = result // Return result synchronously / 同步返回结果
    })

    return { channel, syncChannel }
  }
}
