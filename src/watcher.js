import config from './config'

import Dep from './observer/dep'
import { parseExpression } from './parsers/expression'
import {
  extend,
  warn,
  isArray,
  isObject,
  nextTick,
  _Set as Set
} from './util/index'

let uid = 0

/**
 * 解析一个表达式,收集依赖,并且当表达式的值改变的时候,
 * 执行callback,$watch和directives都在使用此类
 * 
 * @param {Vue} vm
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoway
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */

export default class Watcher {
  constructor (vm, expOrFn, cb, options) {
    if (options) {
      extend(this, options)
    }
    const isFn = typeof expOrFn === 'function'
    this.vm = vm
    vm._watchers.push(this)
    this.expression = expOrFn
    this.cb = cb
    this.id = ++uid
    this.active = true
    // lazy watcher不会在初始化就求值,会在get的时候求值
    // 如果this.dirty为true,在get的时候就会求值
    // 所以初始化时标记为dirty,下次get的时候一定会求值
    this.dirty = this.lazy // for lazy watchers
    // deps存储当前的依赖,而新一轮收集的依赖则会放到newDdeps中
    // 原因是当依赖变动后,需要清除不在依赖的dep,再将自身从这些dep里面移除
    // 这一步在afterGet中执行
    this.deps = []
    this.newDeps = []
    // 使用set以提升对比过程的效率,不使用set的话,判断deps是否存在一个dep
    // 复杂度为O(n),使用之后则为O(1)
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.prevError = null // for async error stacks
    if (isFn) {
      // 计算属性会进入这里
      this.getter = expOrFn
      this.setter = undefined
    } else {
      // 把expression解析为一个对象,对象的get/set存放了 获取/设置 的函数
      // 比如hello解析的get函数为function (scope) { return scope.hello }
      const res = parseExpression(expOrFn, this.twoway)
      this.getter = res.get
      // 比如scope.a = {b: {c: 0}} 而expression为a.b.c
      // 执行res.set(scope, 123)能的到scope.a变成{b: {c: 123}}
      this.setter = res.set
    }
    // 执行get(),拿到表达式的值同时完成首轮依赖收集
    // 如果是lazy watcher则不在此处计算初值
    this.value = this.lazy
      ? undefined
      : this.get()
    // 在vm._digest() 执行时防止误触 deep/Array watchers
    this.queued = this.shallow = false
  }

  get () {
    // 只有一行,将this赋值给Dep.target
    this.beforeGet()
    // v-for情况下,this.scope有值,是对应的数组元素
    const scope = this.scope || this.vm
    let value
    try {
      // 初始求值和首轮依赖收集
      value = this.getter.call(scope, scope)
    } catch (e) {
      warn(
        'Error when evaluating expression' +
        '"' + this.expression + '": ' + e.toString(),
        this.vm
      )
    }
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    if (this.preProcess) {
      value = this.preProcess(value)
    }
    if (this.filters) {
      value = scope._applyFilters(value, null, this.filters, false)
    }
    if (this.postProcess) {
      value = this.postProcess(value)
    }
    this.afterGet()
    return value
  }



  beforeGet () {
    Dep.target = this
  }



}


const seenObjects = new Set()
function traverse (val, seen) {
  let i, keys 
  if (!seen) {
    seen = seenObjects
    seen.clear()
  }
  const isA = isArray(val)
  const isO = isObject(val)
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) {
      const depId = val.__ob__.dep.id
      if (seen.has(depId)) {
        return
      } else {
        seen.add(depId)
      } 
    }
    if (isA) {
      i = val.length 
      while (i--) traverse(val[i], seen)
    } else if (isO) {
      keys = Object.keys(val)
      i = keys.length
      while (i--) traverse(val[keys[i]], seen)
    }
  }
}