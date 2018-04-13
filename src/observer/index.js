import {
  def,
  hasOwn,
  isPlainObject,
  isArray
} from '../util/index'


export function Observer (value) {
  this.value = value
  this.dep = new Dep()
  // 给value添加 __ob__ 属性(Observer)
  def(value, '__ob__', this)
  if (isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment
    augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  } else {
    // 是对象的话，遍历每个属性
    this.walk(value)
  }
}


/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notiy owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 * 
 * 添加一个拥有者实例，当 $set/$delete 发生，我们可以通知拥有者实例
 * 代理这些属性并且吸收这些 watcher，只有在对象被当做实例的根 $data
 * 监听时，才会触发
 * 
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm)
}


/**
 * Attempt to create an observer instance for a value,
 * returns a new Observer if successfully observed,
 * or the existing observer if the value already has one.
 * 
 * @param {*} value 
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 */

export function observe (value, vm) {
  // make sure that only object can come in.
  if (!value || typeof value !== 'object') {
    return
  }
  let ob
  if (
    hasOwn(value, '__ob__') && 
    value.__ob__ instanceof Observer
  ) {
    ob = value.__ob__
  } else if (
    isArray(value) || isPlainObject(value) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 是数组或者对象的话就遍历observe每个属性
    ob = new Observer(value)
  }
  if (ob && vm) {
    ob.addVm(vm)
  }
  return ob
}

/**
 * Observe a list of Array items.
 * 
 * @param {Array} items 
 */

export function observeArray (items) {
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
}

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 * 
 * @param {Object} obj 
 */
Observer.prototype.walk = function (obj) {
  let keys = Object.keys(obj)
  for (let i = 0, l = keys.length; i < l; i++) {
    this.convert(keys[i], obj[keys[i]])
  }
}


/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 * @param {String} key 
 * @param {*} val 
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val)
}

/**
 * Define a reactive property on an object.
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 */
export function defineReactive (obj, key, val) {
  let dep = new Dep()
  let property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return 
  }

  // 缓存对象原先可能存在的 getter & setter
  let getter = property && property.get,
      setter = property && property.set
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // 如果原先存在getter，value为getter取出的值，否则为val
      let value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
      }
    },
    set: function reactiveSetter (newVal) {
      
    }
  })
}