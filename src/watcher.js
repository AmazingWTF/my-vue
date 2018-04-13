
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
  this.active = true  // -----> why?
  this.dirty = this.lazy  // -----> why?
  // 用deps存储当前依赖，而新一轮依赖收集的过程中收集到的依赖存储在newDeps中
  // 之所以要使用一个新的数组来存放新的依赖是因为当依赖变动之后，
  // 比如由依赖a和b变成依赖a和c
  // 那么需要将原先的依赖订阅清除掉，也就是从b的subs数组中移除当前watcher，因为我已经不想监听b的变动了
  // 所以我需要对比deps和newDeps，找出不再依赖的dep，然后dep.removeSub(当前watcher)，这一步在afterGet中完成
  this.deps = new Set()
  this.newDeps = new Set()

  // parse expression for getter/setter
  if (isFn) {
    // 是computed属性
    this.getter = expOrFn
    this.setter = undefined
  } else {
    // 将expression解析为一个对象，对象的get/set属性中存放了读取/设置的方法
    let res = parseExpression(expOrFn, this.twoWay)
    this.getter = res.get
    this.set = res.set
  }

}
