import Dep from './observer/Dep'
let uid = 0

export default class Watcher {
  constructor (obj, getter, cb, options) {
    this.obj = obj
    this.getter = getter
    this.cb = cb
    this.deps = []
    this.id = ++uid
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
    const value = this.getter.call(this.obj)
    Dep.target = null
    return value
  }
  addDep (dep) {
    this.deps.push(dep)
  }
  update () {
    if (this.lazy) {
      this.dirty = true
      return
    }
    const newValue = this.getter.call(this.obj)
    const oldValue = this.value
    this.value = newValue
    this.cb.call(this.obj, newValue, oldValue)
  }
  // 清除当前watcher
  teardown () {
    this.deps.forEach(dep => dep.removeSub(this))
    this.deps = []
  }
  evaluate () {
    this.value = this.getter.call(this.obj)
    // 脏检查机制触发后，重置dirty
    this.dirty = false
  }
}
