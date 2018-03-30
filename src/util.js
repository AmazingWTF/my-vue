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
