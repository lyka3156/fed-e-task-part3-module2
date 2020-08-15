/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters(Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  // 遍历 ASSET_TYPES 数组，为 Vue 定义相应的方法
  // ASSET_TYPES 包括了 directive,component,filter
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      // 1. 第二个参数没有，就是获取之前定义的directive,component,filter
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        // 2. 注册全局的directive,component,filter
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }

        // 2.1 定义的是组件，
        // 第二个参数是 Vue.extend Vue.component，就不需要处理了，直接返回 
        // 第二个参数是原始的object对象，做如下的处理
        // Vue.component("comp",{template:""})
        // isPlainObject => Object.prototype.toString.call(obj) === '[object Object]'
        if (type === 'component' && isPlainObject(definition)) {
          // 设置组件的名称
          definition.name = definition.name || id
          // 把组件配置(普通对象)转换为组件的构造函数
          definition = this.options._base.extend(definition)
        }

        // 2.3 定义的是指令，
        // 第二个参数是对象，就不需要处理了，直接返回 
        // 第二个参数是函数，会做如下处理
        if (type === 'directive' && typeof definition === 'function') {
          // 把函数设置给bind和update这两个方法
          definition = { bind: definition, update: definition }
        }
        // 3. 全局注册、存储资源并赋值
        // 将定义的directive,component,filter存到options属性中，方便下次拿到
        // this.options["component"]["comp"] = definition
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
