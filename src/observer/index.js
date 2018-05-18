import Dep from './dep'
import { arrayMethods } from './array'
import {
  def,
  isArray,
  isPlainObject,
  hasProto,
  hasOwn
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * 默认情况下，当一个reactive值变化，新设置的值也会别转化成为一个
 * reactive的值。但是在某些特定情况下，比如v-for的scope alias和
 * props中，我们不想推动转化，因为这个值可能在一个frozen的数据中
 * 
 * 所以什么时候我们想在不convert的新值的情况下设置一个reactive属性
 * 就可以将回调放入下面的函数
 */
let shouldConvert = true
export function withoutConversion (fn) {
  shouldConvert = false
  fn()
  shouldConvert = true
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 * 
 * @param {Array|Object} value
 * @constructor
 */

export class Observer {
  constructor (value) {
    this._init(value)
  }

  _init (value) {
    this.value = value
    this.dep = new Dep()
    def(value, '__ob__', this)
    if (isArray(value)) {
      // 对数组的__proto__进行改写，没有就直接放在数组身上
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      // 是对象则遍历每个属性
      this.walk(value)
    }
  }


  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   * 
   * @param {Object} obj
   */

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0, l = keys.length; i < l; i++) {
      this.convert(keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items.
   */

  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }

  /**
   * Convert a property into getter/setter so we can emit
   * the events when the property is accessed/changed.
   * 
   * @param {String} key
   * @param {*} val
   */

  convert (key, val) {
    defineReactive(this.value, key, val)
  }

  /**
   * Add an owner vm, so that when $set/$delete mutations
   * happen we can notify owner vms to proxy the keys and
   * digest he watchers. This is only called when the object
   * is observed as an instance's root $data.
   * 
   * @param {Vue} vm
   */

  addVm (vm) {
    (this.vms || (this.vms = [])).push(vm)
  }

  /**
   * Remove an owner vm. This is called when the object is
   * swapped out as an instance's $data object.
   * 
   * @param {Vue} vm
   */

  removeVm (vm) {
    this.vms.$remove(vm)
  }



}

// 改写__proto__属性
function protoAugment (target, src) {
  target.__proto__ = src
}

// 直接将属性设置在数组实例上
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}


export function observe (value, vm) {
  if (!value || typeof value !== 'object') {
    return
  }
  let obj
  if (
    hasOwn(value, '__ob__') &&
    value.__ob__ instanceof Observer
  ) {
    ob = value.__ob__
  } else if (
    shouldConvert &&
    (isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (ob && vm) {
    // 如果直接是data，而不是data属性
    // 将vm加入到ob的vms中，因为有的时候需要对数据手动执行$set/$delete操作
    // 那么就要提示vm实例这个行为的发生(让vm代理这个新$set的数据,和更新界面)
    ob.addVm(vm)
  }
  return ob
}


export function defineReactive (obj, key, val) {
  // 生成一个新的Dep实例，会被闭包到getter和setter中
  let dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  const getter = property && property.get
  const setter = property && property.set
  const chlidOb = observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      let value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (chlidOb) {
          // 如果value在observe中生成了ob实例，那么久让ob的dep收集依赖
          chlidOb.dep.depend()
        }
        if (isArray(value)) {
          for (let e, i = 0, l = value.length; i < l; i++) {
            e = value[i]
            // 数组元素也是对象，并且也observe生成了ob实例，那么就让其ob的dep也收集依赖
            e && e.__ob__ && e.__ob__.dep.depend()
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      let value = getter ? getter.call(obj) : val
      if (newVal === value) {
        return
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // observe 这个新 set 的值
      chlidOb = observe(newVal)
      dep.notify()
    }
  })
}