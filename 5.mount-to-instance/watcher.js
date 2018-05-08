import Dep from './observer/Dep'
let uid = 0

export default class Watcher {
  constructor (obj, getter, cb) {
    this.obj = obj
    this.getter = getter
    this.cb = cb
    this.deps = []
    this.id = ++uid
    this.value = this.get()
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
}
