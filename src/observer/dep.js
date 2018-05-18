import { toArray } from '../util/index'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */

export default class Dep {
  constructor () {
    this.id = uid++
    this.subs = []
  }


  addSub (sub) {
    this.subs.push(sub)
  }


  removeSub (sub) {
    this.subs.$remove(sub)
  }

  /**
   * Add self as a dependency to the target watcher.
   */

  depend () {
    Dep.target.addDep(this)
  }

  notify () {
    const subs = toArray(this.subs)
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null