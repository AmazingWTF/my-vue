
import Dep from './observer/dep'
import {
  extend,
  isArray,
  isPlainObject,
  warn
} from './util/index'


let uid = 0

/**
 * 
 * @param {Vue} vm 
 * @param {*} expOrFn 
 * @param {*} cb 
 * @param {*} options 
 */

export default function Watcher (vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options)
  }
  const isFn = typeof expOrFn === 'function'
  this.vm = vm
  vm._watchers.push(this)
  this.expression = expOrFn
  // 把回调放在this上，在完成了一轮的数据变动之后，在批处理最后阶段执行cb(一般为DOM操作)
  this.cb = cb
  this.id = ++uid
  this.active = true
  

}
