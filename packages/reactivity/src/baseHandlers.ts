import { track, trigger } from './effect'

/**
 * @get getter 回调方法
 * @createGetter 创建 getter 回调方法
 */
const get = createGetter()

function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    // 利用 Reflect 得到返回值
    const res = Reflect.get(target, key, receiver)

    // 收集依赖
    track(target, key)

    // 获取返回值
    return res
  }
}

/**
 * @set setter 回调方法
 * @createSetter 创建 setter 回调方法
 */
const set = createSetter()

function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: any,
    receiver: object
  ) {
    // 利用 Reflect.set 设置新值
    const res = Reflect.set(target, key, value, receiver)

    // 触发依赖
    trigger(target, key)

    // 返回新的值
    return res
  }
}

/**
 * @mutableHandlers 响应性的 handler
 */
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
