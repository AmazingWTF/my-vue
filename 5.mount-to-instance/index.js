import Event from './event/event'
import proxy from './proxy'
import observe from './observer/observer'
import Watcher from './watcher'
import Computed from './computed/computed'

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
    // 此处需要填充别的内容，暂为测试可用
    const watches = options.watch
      for (let k in watches) {
        new Watcher(vm, function () {
          return k.split('.').reduce((obj, key) => obj[key], vm)
        }, watches[k])
      }
  }

}
