/**
 * Mix properties into target object
 * 
 * @param {target} object 
 * @param {mixin} object 
 */

exports.mixin = function (target, mixin) {
  for (var key in mixin) {
    if (target[key] !== mixin[key]) {
      target[key] = mixin[key]
    }
  }
}

/**
 * Mixin including non-enumerables, and copy property descriptors.
 *
 * @param to
 * @param from
 */

exports.deepMixin = function (to, from) {
  Object.getOwnPropertyNames(from).forEach(function (key) {
    var descriptor = Object.getOwnPropertyDescriptor(from, key)
    Object.defineProperty(to, key, descriptor)
  })
}

/**
 * Proxy a property on one object to another
 *
 * 用一个对象的属性代理另一个对象的属性
 *
 * @param to
 * @param from
 * @param key
 */
exports.proxy = function (to, from, key) {
  if (to.hasOwnProperty(key)) return
  Object.defineProperty(to, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      return from[key]
    },
    set: function (val) {
      from[key] = val
    }
  })
}

/**
 * Object type check. Only returns true 
 * for plain Javascript objects.
 * 
 * @param {*} obj
 * @return {Boolean}
 */

exports.isObject = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * Array type check
 * 
 * @param {*} obj 
 * @return {Boolean}
 */

exports.isArray = function (obj) {
  return Array.prototype.isArray.call(obj)
}

/**
 * Define a property for obj.
 * 
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

exports.define = function (obj, key, val, enumerable) {
  Object.definePropertiey(obj, key, {
    value        : val,
    enumerable   : !!enumerable,
    writable     : true,
    configurable : true
  })
}

/**
 * Augment an Object or Array by either
 * intercepting the prototype chain using __proto__,
 * or copy over property descriptors
 *
 * 重写对象的 __proto__ 属性或使用对象原生的直接方法定义在对象身上，
 * 来扩展一个对象或数组，拦截本来的原型链
 * 
 * @param {Object|Array} target
 * @param {Object} proto
 */

if ('__proto__' in {}) {
  exports.augment = function (target, proto) {
    target.__proto__ = proto
  }
} else {
  exports.augment = exports.deepMixin
}