import IpcHandler from './IpcHandler'

export default class IpcBridge {
    private _api: Record<string, any> = {}
    private _handlers: IpcHandler[] = []

    /**
     * Add a single IPC handler
     * 添加单个IPC处理器
     * @param handler - IPC handler instance (IPC处理器实例)
     */
    addHandler(handler: IpcHandler): void {
        this._handlers.push(handler)
    }

    /**
     * Add multiple IPC handlers
     * 添加多个IPC处理器
     * @param handlers - Array of IPC handler instances (IPC处理器实例数组)
     */
    addHandlers(handlers: IpcHandler[]): void {
        this._handlers = this._handlers.concat(handlers)
    }

    /**
     * Remove IPC handler by name
     * 移除指定名称的IPC处理器
     * @param name - Handler name (处理器名称)
     */
    removeHandler(name: string): void {
        this._handlers = this._handlers.filter((handler) => handler.name !== name)
    }

    /**
     * Trigger callback of specified IPC handler
     * 触发指定名称的IPC处理器回调
     * @param data - Object containing handler name and data (包含处理器名称和数据的对象)
     * @returns Return value of the callback function (回调函数的返回值)
     */
    handle(data: any): any {
        if (!data) return
        for (const handler of this._handlers) {
            if (data.name === handler.name && handler.callback) {
                return handler.callback(this._api, data)
            }
        }
    }

    /**
     * Add API
     * 添加 API
     * @param key - API key (API 名称)
     * @param api - API object (API 对象)
     */
    addApi(key: string, api: any): void {
        this._api[key] = api
    }
}
