/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 */
export function query(el: string | Element): Element {
  // 如果 el 是字符串，它就是选择器
  if (typeof el === 'string') {
    // 找到选择器对应的元素
    const selected = document.querySelector(el)
    // 如果没有找到这个元素
    if (!selected) {
      // 开发环境报一个警告
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      // 创建一个 div 返回
      return document.createElement('div')
    }
    return selected
  } else {
    // el 不是字符串就是 dom 对象 直接返回
    return el
  }
}
