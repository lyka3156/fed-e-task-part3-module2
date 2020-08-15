/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI(Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  // 不是生产环境调用config的set方法时报一个警告
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      // 不要给Vue.config去重新复制，你可以在Vue.config中挂载对应的属性和方法
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 1. 初始化 Vue.config 对象
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 2. 这些工具方法不视作全局API的一部分，除非你已经意识到莫些风险，否则不要去依赖他们
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 3. 静态方法 set/delete/nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 4. 让一个对象可响应
  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  // 5. 初始化 Vue.options 对象
  // 并给其扩展 components/directives/filters 属性 (全局属性)
  // 功能： 记录使用Vue.component/directive/filter注册的全局component/directive/filter
  Vue.options = Object.create(null)
  // ASSET_TYPES 常量 ['component','directive','filter']
  ASSET_TYPES.forEach(type => {
      Vue.options[type + 's'] = Object.create(null)
    })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.

  // 6. 在 _base 属性中记录 Vue 构造函数
  Vue.options._base = Vue

  // 7. 设置 keep-alive 组件    (注册全局组件)
  // extend 就是一个浅拷贝
  extend(Vue.options.components, builtInComponents)

  // 8. 注册全局方法
  // 8.1 注册 Vue.use() 用来注册插件
  initUse(Vue)
  // 8.2 注册 Vue.mixin() 实现混入 
  initMixin(Vue)
  // 8.3 注册 Vue.extend() 基于传入的options返回一个组件的构造函数
  // 返回 Vue.component 构造函数  他的原型继承自 Vue   (所有的组件都是继承自Vue)
  initExtend(Vue)
  // 8.4 注册 Vue.directive、component、filter 
  initAssetRegisters(Vue)
}
