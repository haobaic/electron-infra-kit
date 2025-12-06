import type WindowBridge from './WindowBridge'

/**
 * Data Change Event Interface
 * 数据变更事件接口
 */
export interface DataChangeEvent {
    /**
     * Change type
     * 变更类型
     */
    type: 'set' | 'delete' | 'clear'
    /**
     * Changed key
     * 变更的键
     */
    key?: string
    /**
     * New value
     * 新值
     */
    value?: any
    /**
     * Old value
     * 旧值
     */
    oldValue?: any
    /**
     * Source window ID
     * 源窗口ID
     */
    windowId?: string
    /**
     * Timestamp
     * 时间戳
     */
    timestamp: number
}

/**
 * Field Permission Interface
 * 字段权限接口
 */
export interface FieldPermission {
    /**
     * Is read-only
     * 是否只读
     */
    readonly: boolean
    /**
     * Allowed window IDs
     * 允许的窗口ID列表
     */
    allowedWindows?: string[]
}

/**
 * Data Store Item Interface
 * 数据存储项接口
 */
export interface DataStoreItem {
    /**
     * Stored value
     * 存储的值
     */
    value: any
    /**
     * Permission settings
     * 权限设置
     */
    permission?: FieldPermission
}

/**
 * Window Bridge Event Handler Interface
 * Window Bridge 事件处理器接口
 */
export interface WindowBridgeHandler {
    /**
     * Event name
     * 事件名称
     */
    eventName: string
    /**
     * Callback function
     * 回调函数
     */
    callback: (event: DataChangeEvent) => void
}

/**
 * Bridge Message Handler Interface
 * 桥接消息处理器接口
 *
 * @template T - Message data type (消息数据类型)
 * @template R - Return value type (返回值类型)
 */
export interface BridgeMessageHandler<T = any, R = any> {
    /**
     * Message name
     * 消息名称
     */
    name: string
    /**
     * Callback function
     * 回调函数
     * @param bridge - WindowBridge instance (WindowBridge 实例)
     * @param data - Message data (消息数据)
     * @returns Result (结果)
     */
    callback: (bridge: WindowBridge, data: T) => R
}
