import Watcher from "../watcher"
import {
  noop
} from '../util/index'

// 将computed变成一个watcher实例，因为watcher会缓存结果在value属性
// 用watcher将computed的get添加为依赖
// vm实例get这个compute属性的时候直接return出watcher的value
// set的时候触发自定义的set

let uid = 0
export default class Computed {
  constructor (ctx, key, option) {
    this.uid = uid++
    this.key = key
    this.option = option
    this.ctx = ctx
    this._init()
  }

  _init () {
    let watcher = new Watcher(
      this.ctx,
      this.option.get || noop,
      noop,
      // 是一个lazy watcher
      {lazy: true}
    )

    Object.defineProperty(this.ctx, this.key, {
      enumerable: true,
      configurable: true,
      set: this.option.set || noop,
      get: function () {
        // 如果是 dirty watcher
        if (watcher.dirty) {
          watcher.evaluate()
        }
        return watcher.value
      }
    })
  }
}