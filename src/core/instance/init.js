import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { initLifecycle, callHook } from './lifecycle'
import { mergeOptions } from '../util/index'

let uid = 0

export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm._uid = uid++
    // 防止被 observe
    vm._isVue = true
    if (options && options._isComponent) {
      // 优化内部组件实例化,因为动态merge很慢,并且没有需要特殊处理的组件options
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(resolveConstructorOptions(vm), options || {}, vm)
    }
    // 生产env 否则 initProxy(vm)
    vm._renderProxy = vm
    vm._self = vm
    // initLifecycle(vm)
    // initEvents(vm)
    // callHook(vm, 'beforeCreate')
    // initState(vm)
    // callHook(vm, 'created')
    // initRender(vm)
  }
}

function initInternalComponent (vm, options) {
  const opts = vm.$options = Object.create(resolveConstructorOptions(vm))
  // 逐个赋值,因为这个比动态枚举快
  opts.parent = options.parent
  opts.propsData = options.propsData
  opts._parentVnode = options._parentVnode
  opts._parentListeners = options._parentListeners
  opts.renderChildren = options.renderChildren
  opts._componentTag = options._componentTag
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

function resolveConstructorOptions (vm) {
  const Ctor = vm.constructor
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = Ctor.super.options
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}