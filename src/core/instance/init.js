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
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    vm._self = vm
    initLifecycle(vm)
    // initEvents(vm)
    // callHook(vm, 'beforeCreate')
    // initState(vm)
    // callHook(vm, 'created')
    initRender(vm)
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

/**
 * 将传入的实例的options属性和其父类的options(存在的话)merge
 * 
 * @param {Component} vm
 * @return {object} - 合并后的options
 */
function resolveConstructorOptions (vm) {
  const Ctor = vm.constructor
  let options = Ctor.options
  // 说明此实例是由extend出来的构造函数实例化出来的
  if (Ctor.super) {
    // 父类此时的options
    const superOptions = Ctor.super.options
    // 父类extend出当前构造函数时的options
    const cachedSuperOptions = Ctor.superOptions
    // super 的 option 发生了变化
    // i.e. 这里应该是直接换了个对象，寻址改变了，否则改变属性的话，不会不相等
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