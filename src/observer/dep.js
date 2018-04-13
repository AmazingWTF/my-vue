import { toArray } from '../util/index'

let uid = 0


/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * 
 * @constructor
 */
export default function Dep () {
  this.id = uid++
  this.subs = []
}


/**
 * the current watcher being evaluated.
 * this is globally unique because there could be only one
 * watcher being evallated any time.
 * Dep.target 中存放着当前正在执行依赖收集的watcher
 * 因为getter不能传参，所以将target放在Dep构造函数的属性中，以便Dep实例能够访问到
 */
Dep.target = null

/**
 * Add a directive subscriber.
 * 
 * @param {Directive} sub 
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub)
}

/**
 * Remove a directive sunscriber.
 * 
 * @param {Directive} sub 
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub)
}

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this)
}

/**
 * Notify all subscribers of a new value.
 */
Dep.prototype.notify = function () {
  // make sure the subs is an Array
  let subs = toArray(this.subs)
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
