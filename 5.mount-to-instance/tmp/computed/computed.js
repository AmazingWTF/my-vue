import {
  noop,
  bind
} from '../util/index'

export default class Computed {
  constructor (ctx, key, option) {
    this.ctx = ctx
    this.key = key
    this.option = option

    this._init()
  }

  _init () {
    const isFn = typeof this.option === 'function'
    const ctx = this.ctx
    let def = {
      enumerable: true,
      configurable: true
    }
    if (isFn) {
      def.get = bind(this.option, ctx)
      def.set = noop
    } else {
      def.set = bind(this.option.set || noop, ctx)
      def.get = bind(this.option.get || noop, ctx)
    }
    Object.defineProperty(ctx, this.key, def)
  }
}