import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 此处不用 class 的原因是因为方便后续给 Vue 实例混入实例成员
function Vue(options) {
  // 开发环境，不是通过 new 实例化 Vue 报个警告 
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 1. 调用 _init()方法
  this._init(options)
}

// 下面这些方法都是给 Vue.property 上注册了一些成员也就是给实例上添加了成员
// 2. 注册 vm 的 _init() 方法，初始化vm
initMixin(Vue)
// 3. 注册 vm 的 $data/$props/$set/$delte/$watch
stateMixin(Vue)
// 4. 初始化事件相关方法    内部使用了发布订阅模式
// $on/$once/$off/$emit
eventsMixin(Vue)
// 5. 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 6. 混入 render
// $nextTick/_render
renderMixin(Vue)

export default Vue
