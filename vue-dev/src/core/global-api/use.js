/* @flow */

import { toArray } from '../util/index'

export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 1. 获取vue安装过的插件数组
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 2. 插件已注册直接返回
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 3. 核心功能是：调用插件的方法，然后传递相应的参数，最后当我们把插件注册好之后，追到到插件数组中

    // 3.1 封装参数
    // 把数组中的第一个元素(plugin)去除，返回一个数组
    const args = toArray(arguments, 1)
    // 把this(Vue)插入数组的第一个位置
    args.unshift(this)
    // 3.2 安装插件
    // 如果插件是是对象
    if (typeof plugin.install === 'function') {
      // 3.2.1 直接调用对象的install方法，安装插件
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 3.2.2 如果插件是函数，直接执行这个函数，安装插件
      plugin.apply(null, args)
    }
    // 3.3 把安装好的插件插入的已安装的插件数组中
    installedPlugins.push(plugin)

    // 4. 返回 Vue 这个构造函数
    return this
  }
}
