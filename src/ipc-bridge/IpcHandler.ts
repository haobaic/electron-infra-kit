import { IpcHandlerCallback } from './ipc-bridge.type'

/**
 * IPC Handler Class
 * IPC 处理器类
 *
 * Wraps IPC message handling logic with type support
 * 封装带类型支持的 IPC 消息处理逻辑
 *
 * @template T - Input data type (输入数据类型)
 * @template R - Return value type (返回值类型)
 */
export default class IpcHandler<T = any, R = any> {
    private _name: string
    private _event: string
    private _callback: IpcHandlerCallback<T, R>

    /**
     * Create IPC Handler instance
     * 创建 IPC 处理器实例
     * @param name - Handler name (处理器名称)
     * @param event - Event to listen for (要监听的事件)
     * @param callback - Callback function triggered on event (事件触发时的回调函数)
     */
    constructor(name: string, event: string, callback: IpcHandlerCallback<T, R>) {
        this._name = name
        this._event = event
        this._callback = callback
    }

    /**
     * Get handler name
     * 获取处理器名称
     */
    get name(): string {
        return this._name
    }

    /**
     * Get event name
     * 获取事件名称
     */
    get event(): string {
        return this._event
    }

    /**
     * Get callback function
     * 获取回调函数
     */
    get callback(): IpcHandlerCallback<T, R> {
        return this._callback
    }
}
