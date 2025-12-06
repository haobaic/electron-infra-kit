/**
 * IPC Handler Callback Interface
 * IPC 处理器回调接口
 *
 * @template T - Input data type (输入数据类型)
 * @template R - Return value type (返回值类型)
 */
export interface IpcHandlerCallback<T = any, R = any> {
  /**
   * Callback function
   * 回调函数
   * @param api - API object exposed to the handler (暴露给处理器的 API 对象)
   * @param data - Input data (输入数据)
   * @returns Result of the operation (操作结果)
   */
  (api: Record<string, any>, data: T): R
}

/**
 * IPC Handler Data Interface
 * IPC 处理器数据接口
 *
 * @template T - Data payload type (数据载荷类型)
 */
export interface IpcHandlerData<T = any> {
  /**
   * Handler name
   * 处理器名称
   */
  name: string
  /**
   * Data payload
   * 数据载荷
   */
  data?: T
}
