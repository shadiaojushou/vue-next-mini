import { isArray } from '@vue/shared'
import { createDep, Dep } from './dep'

type KeyToDepMap = Map<any, Dep> // 实现一对多的依赖关系

// type KeyToDepMap = Map<any, ReactiveEffect>
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * @track 依赖触发
 * @param target WeakMap 的 key
 * @param key WeakMap 的 value,代理对象的 key,当依赖触发是,需要根据该 key 获取
 */
export function track(target: object, key: unknown) {
  // 如果当前不存在执行函数，则直接return
  if (!activeEffect) return

  // 尝试从 targetMap 中获取 target 获取 Map
  let depsMap = targetMap.get(target)

  // 如果depsMap 不存在，则生成一个新的 map 对象，并将该对象赋值给对应的 value
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  // 为指定的 map 指定 key,设置回调函数(单个依赖)
  // depsMap.set(key, activeEffect)

  // 获取指定 key 的 dep
  let dep = depsMap.get(key)
  // 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中
  if (!dep) {
    // depsMap.set(key, (dep = new Set()))
    depsMap.set(key, (dep = createDep()))
  }

  // 触发trackEffect,将当前的 effect 放入到 dep 中
  trackEffects(dep)
}

/**
 * @trackEffects  利用 dep 依次跟踪指定 key 的所有 effect
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * @trigger 依赖触发
 */
export function trigger(target: object, key?: unknown) {
  // 根据 target 获取对应的 map 实例
  const depsMap = targetMap.get(target)

  // 如果 depsMap 不存在，则直接 return
  if (!depsMap) return

  /*  单个依赖的触发
  // 依据key,从 desMap 中获取对应的 value(回调函数)，该value是一个 ReactiveEffect 实例
   const effects = depsMap.get(key) as ReactiveEffect

  // 如果 effect不存在，则直接 return
  if (!effects) return

  // 如果存在，则执行 run 函数
  effects.run()
  */

  // 多个依赖的触发
  const dep: Dep | undefined = depsMap.get(key)

  // 如果 dep 不存在，则直接 return
  if (!dep) return

  // 如果存在，则依次执行 dep 中的 effect
  triggerEffects(dep)
}

/**
 * @triggerEffects  依次触发 dep 中保存的依赖
 */
export function triggerEffects(dep: Dep) {
  // 将 dep 构建成一个数组
  const effects = isArray(dep) ? dep : [...dep]

  // 依次执行 effects 中的 effect
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

//
/**
 * @triggerEffect  触发依赖的执行
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}

/**
 * @activeEffect 单例的，当前的 effect
 */
let activeEffect: ReactiveEffect | undefined

/**
 * @ReactiveEffect 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    activeEffect = this

    return this.fn()
  }
}

/**
 * @effect 函数处理
 */
export function effect<T = any>(fn: () => T) {
  // 生成 ReactiveEffect 实例对象
  const _effect = new ReactiveEffect(fn)

  // 执行 run 函数
  _effect.run()
}
