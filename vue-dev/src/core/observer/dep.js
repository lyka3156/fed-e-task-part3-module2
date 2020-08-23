/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// dep 是个可观察对象，可以有多个指令订阅它
export default class Dep {
  // 静态属性，watcher 对象
  static target: ?Watcher;
  // dep 实例 Id
  id: number;
  // dep 实例对应的 watcher 对象/订阅者数组
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++
    this.subs = []
  }

  // 添加新的 订阅者 watcher 对象
  addSub(sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除 订阅者 watcher 对象
  removeSub(sub: Watcher) {
    remove(this.subs, sub)
  }

  // 将观察对象和 watcher 建立依赖
  depend() {
    if (Dep.target) {
      // 如果 target 存在，把 dep 对象添加到 watcher 的依赖中
      Dep.target.addDep(this)
    }
  }
  // 发送通知
  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    // 排序
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 调用每个订阅者的 update 方法实现更新
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target 用来存放目前正在使用的watcher
// 全局唯一，并且一次也只能有一个 watcher 被使用
Dep.target = null
const targetStack = []

// 入栈并将当前 watcher 赋值给 Dep.target
// 每一个 vue 的组件都对应一个 watcher 对象
// 如果组件有嵌套的话，... 这就是栈的目的
// 父子组件嵌套的时候先把组件对应的 watcher 入栈，
// 再去处理子组件的 watcher, 子组件的处理完毕后，
// 再把父组件对应的 watcher 出栈，继续操作。
export function pushTarget(target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  // 出栈操作
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
