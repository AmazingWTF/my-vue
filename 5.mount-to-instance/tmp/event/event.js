import {
  isArray
} from '../util/index'


let uid = 0

export default class Event {
  constructor () {
    this.id = uid++
    this._events = []
  }

  $on (eventName, fn) {
    if (isArray(eventName)) {
      eventName.forEach(name => this.$on(name, fn))
      return
    }
    else if (isArray(fn)) {
      fn.forEach(fnc => this.$on(eventName, fnc))
      return
    }
    (this._events[eventName] || (this._events[eventName] = [])).push(fn)
    return this
  }
  $once (eventName, fn) {
    let self = this
    function on () {
      self.$off(eventName, on)
      fn.apply(self, arguments)
    }
    on.fn = fn
    self.$on(eventName, on)
    return self
  }
  $off (eventName, fn) {
    if (!arguments.length) {
      return this
    }
    if (isArray(eventName)) {
      eventName.forEach(name => this.$off(name, fn))
      return this
    }
    const cbs = this._events[eventName]
    if (!cbs) return
    if (!fn) {
      this._events[eventName] = null
      return this
    } else {
      if (!isArray(fn)) {
        fn = [fn]
      }
      fn.forEach(fnc => {
        for (let i = 0, l = cbs.length; i < l; i++) {
          const cb = cbs[i]
          if (cb === fnc || cb.fn === fnc) {
            cbs.splice(i, 1)
            break
          }
        }
      })
    }
  }

  $emit (eventName, ...args) {
    let cbs = this._events[eventName]
    cbs && cbs.forEach(fn => fn.apply(null, args))
  }
}