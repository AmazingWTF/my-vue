import {
  noop,
  bind
} from '../util/index'
import Watcher from '../wather'

export default class Computed {
  constructor (ctx, key, option) {
    this.ctx = ctx
    this.key = key
    this.option = option

    this._init()
  }

  _init () {
    let getter = noop
    this._watch = []
    if (typeof this.option === 'function') {
      getter = this.option
    } else {
      getter = this.option.get
    }
    let watcher = new Watcher(
      this.ctx,
      getter || noop,
      noop,
      { lazy: true }
    )
    this._watch.push(watcher)
    Object.defineProperty(this.ctx, this.key, {
      enumerable: true,
      configurable: true,
      set: this.option.set || noop,
      get () {
        if (watcher.dirty) {
          watcher.evaluate()
        }
        return watcher.value
      }
    })
  }
}