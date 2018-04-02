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
 * Object type check. Only returns true 
 * for plain Javascript objects.
 * 
 * @param {*} obj
 * @return {Boolean}
 */
exports.isObject = function (obj) {
  return Object.toString.call(obj) === '[object Object]'
}

/**
 * Array type check
 * 
 * @param {*} obj 
 * @return {Boolean}
 */
exports.isArray  = function (obj) {
  return Array.isArray.call(obj)
}

exports.define = function (obj, key, val) {
  Object.definePropertiey(obj, key, {
    value: val,
    enumerable: false,
    writable: true,
    configurable: true
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
  exports.augment = function (target, proto) {
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      var descriptor = Object.getOwnPropertyDescriptor(proto, key)
      Object.defineProperty(target, key, descriptor)
    })
  }
}