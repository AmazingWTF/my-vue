import Event from './event/event'
import proxy from './proxy'
import observe from './observer/observer'
import Watcher from './watcher'

export default class Vue extends Event {
  constructor (options) {
    super()
    this._init(options)
  }

  _init (options) {
    let vm = this
    // 代理data
    vm._data = options.data.call(vm)
    proxy(vm, vm._data)
    // 代理methods
    const methods = options.methods
    if (methods) {
      for (let k in methods) {
        vm[k] = methods[k].bind(vm)
      }
    }
    observe(vm._data)

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
