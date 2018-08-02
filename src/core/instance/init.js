import { initProxy } from './proxy'

import { mergeOptions } from '../util/index'


export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm._uid = uid++
    vm._isVue = true
    if (options && options._isComponent) {
      // 优化内部组件实例化，因为动态merge options太慢了，
      // and内部组件的options没有需要特殊处理的
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(resolveConstructorOptions(vm), options || {}, vm)
    }

    initProxy(vm)

    vm._self = vm

  }
}