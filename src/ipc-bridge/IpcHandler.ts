export default class IpcHandler {
    private _name: string
    private _event: string
    private _callback: (api: Record<string, any>, data: any) => any

    /**
     * 创建IPC处理器实例
     * @param name - 处理器名称
     * @param event - 要监听的事件
     * @param callback - 事件触发时的回调函数
     */
    constructor(name: string, event: string, callback: (api: Record<string, any>, data: any) => any) {
        this._name = name
        this._event = event
        this._callback = callback
    }

    get name(): string {
        return this._name
    }

    get event(): string {
        return this._event
    }

    get callback(): (api: Record<string, any>, data: any) => any {
        return this._callback
    }
}
