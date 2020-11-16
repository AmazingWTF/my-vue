import { Dep } from './Dep.mjs'

// 解耦
// 自动
export class Watcher {
  constructor (obj, getter, callback) {
    this.obj = obj
    this.cb = callback
    this.getter = getter
    this.deps = []
    this.value = this.get()
  }

  get () {
    Dep.target = this
    let value = this.obj[this.getter]
    Dep.target = null
    return value
  }

  update () {
    const value = this.obj[this.getter]
    const oldValue = this.value
    this.value = value
    this.cb.call(this.obj, value, oldValue)
  }

  addDep (dep) {
    if (!this.deps.includes(dep)) {
      this.deps.push(dep)
    }
  }
}
