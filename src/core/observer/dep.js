import { remove } from '../util/index'

let uid = 0

/**
 * dep是一个可监视对象，可以有多个指令订阅
 */
export default class Dep {

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub () {
    this.subs.push(sub)
  }

  removeSub (sub) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update
    }
  }
}

Dep.target = null
const targetStack = []

export function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}