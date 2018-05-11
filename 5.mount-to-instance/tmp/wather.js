import Dep from './observer/Dep'

let uid = 0

export default class Watcher {
  constructor (ctx, getter, cb) {
    this.ctx = ctx
    this.getter = getter
    this.cb = cb
    this.id = uid++
    this.deps = []
    this.value = this.get()
  }

  get () {
    Dep.target = this
    const value = this.getter.call(this.ctx)
    Dep.target = null
    // this.value = value
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
    const newVal = this.getter.call(this.ctx)
    const oldVal = this.value
    this.value = newVal
    this.cb.call(this.ctx, newVal, oldVal)
  }
}