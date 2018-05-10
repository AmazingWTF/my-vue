import Event from './event/event'
import proxy from './proxy'
import observe from './observer/observer'
import Watcher from './watcher'
import Computed from './computed/computed'
import {
  mergeOptions
} from './util/index'

let uid = 0

export default class Vue extends Event {
  constructor (options) {
    super()
    this.uid = uid++
    this._init(options)
  }

  _init (options) {
    let vm = this
    // 代理data
    vm._data = options.data.call(vm)
    observe(vm._data)
    
    proxy(vm, vm._data)
    // 代理methods
    const methods = options.methods
    if (methods) {
      for (let k in methods) {
        vm[k] = methods[k].bind(vm)
      }
    }
    // 代理computed
    const computed = options.computed
    if (computed) {
      for (let k in computed) {
        new Computed(vm, k, computed[k])
      }
    }
    // watch 处理
    const watches = options.watch
    for (let k in watches) {
      new Watcher(vm, function () {
        return k.split('.').reduce((obj, key) => obj[key], vm)
      }, watches[k])
    }
    // 合并options
    vm.$options = mergeOptions(
      this.constructor.options,
      options,
      vm
    )
  }
}

Vue.options = {
  components: {},
  _base: Vue
}

Vue.extend = function (extendOptions) {
  const Super = this

  // 完全继承自Vue构造函数
  class Sub extends Super {
    constructor (options) {
      super(options)
    }
  }
  // 
  Sub.options = mergeOptions(
    Super.options, // 公共属性，Vue构造函数的属性
    extendOptions  // 作为extend方法参数的options
  )

  Sub.super = Super // 为了将Sub的super变成Vue实例，以便Sub调用extend使用super属性
  Sub.extend = Super.extend // 将Sub的extend绑定到Sub，以便调用extend

  return Sub
}