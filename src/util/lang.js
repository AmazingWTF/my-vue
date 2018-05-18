

const hasOwnProperty = Object.prototype.hasOwnProperty
/**
 * Check whether thw object has the property.
 * @param {Object} obj 
 * @param {String} key 
 * @return {Boolean}
 */
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Simple bind, faster than native.
 * 
 * @param {Function} fn 
 * @param {Object} ctx
 * @return {Function}
 */

export const bind = function (fn, ctx) {
  return function (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
}

/**
 * Quick object check - this is primarily used to tell
 * Obejcts from primitive values when we know the value
 * is a JSON-compliant type.
 * 
 * @param {*} obj 
 * @return {Boolean}
 */
export const isObject = function (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain Javascript objects.
 * 
 * @param {*} obj
 * @return {Boolean}
 */

const toString = Object.prototype.toString
const OBJECT_STRING = '[object Object]'
export const isPlainObject = function (obj) {
  return toString.call(obj) === OBJECT_STRING
}

export const isArray = Array.isArray

/**
 * Define a property.
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 * @param {Boolean} enumerable 
 */
export const def = function (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 * 
 * @param {Array} arr 
 * @param {*} obj 
 */
export const indexOf = function (arr, obj) {
  let i = arr.length
  while (i--) {
    if (arr[i] === obj) return i
  }
  return -1
}

export function extend (to, from) {
  const keys = Object.keys(from)
  let i = keys.length
  while (i--) {
    to[keys[i]] = from[keys[i]]
  }
  return to
}