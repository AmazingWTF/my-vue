import { Dep } from './Dep.mjs'

export function defineReactive (obj, key, value) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get () {
      if (Dep.target) {
        dep.addSub(Dep.target)
        Dep.target.addDep(dep)
      }
      return value
    },
    set (val) {
      if (value !== val) {
        value = val
        dep.notify()
      }
    }
  })
}
