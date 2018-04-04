/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0

export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i = l; i++) {
      subs[i].update()
    }
  }
}

Dep.target =null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = target
}


export function popTarget () {
  Dep.target = targetStack.pop()
}