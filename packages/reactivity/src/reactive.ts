/**
 * 1.为复杂数据类型，创建响应性对象
 * @param target 被代理对象
 * @returns 代理对象
 */

import { mutableHandlers } from './baseHandlers'

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

/**
 * 2.创建响应性对象
 * @param target 被代理对象
 * @param baseHandlers handler
 */
function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Object, any>
) {
  // 如果该实例已经被代理，则直接读取
  const existingProxy = proxyMap.get(target)

  if (existingProxy) return existingProxy

  // 未被代理，则创建代理 创建proxy实例
  const proxy = new Proxy(target, baseHandlers)

  // 缓存代理对象
  proxyMap.set(target, proxy)

  return proxy
}

/**
 * 3.响应性 Map 缓存对象
 * key：target
 * val：proxy
 */
export const reactiveMap = new WeakMap<object, any>()
