import Dep from './observer/Dep'

let uid = 0

export default class Watcher {
  constructor (ctx, getter, cb, options) {
    this.ctx = ctx
    this.getter = getter
    this.cb = cb
    this.id = uid++
    this.deps = []
    this.value = this.get()
    if (options) {
      this.lazy = !!options.lazy
    } else {
      this.lazy = false
    }
    this.dirty = this.lazy
  }

  get () {
    Dep.target = this
    const value = this.getter.call(this.ctx)
    Dep.target = null
    return value
  }
  addDep (dep) {
    this.deps.push(dep)
  }
  teardown () {
    this.deps.forEach(dep => dep.removeSub(this))
    this.deps = []
  }
  update () {
    if (this.lazy) {
      this.dirty = true
      return
    }
    const newVal = this.getter.call(this.ctx)
    const oldVal = this.value
    this.value = newVal
    this.cb.call(this.ctx, newVal, oldVal)
  }
  evaluate () {
    this.value = this.getter.call(this.ctx)
    this.dirty = false
  }
}