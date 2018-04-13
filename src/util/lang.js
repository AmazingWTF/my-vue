let toString = Object.prototype.toString

/**
 * Quick objcet check - this is primarily used to tell
 * objects from primitive values when we know the value
 * is a JSON-compliant type.
 * 
 * @param {*} obj
 * @return {Boolean}
 */
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Quick object check.
 * 
 * @param {*} obj 
 * @return {Boolean}
 */

const OBJECT_STRING = '[object Object]'
export function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

export const isArray = Array.isArray

/**
 * Check if a string starts with '_' or '$'
 * @param {String} key 
 */
export function isReserved (key) {
  let c = (key + '').charCodeAt(0)
  return c === 0x24 || c === 0x5f
}

/**
 * Check whether the object has the property.
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */
let hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwn.call(obj, key)
}

/**
 * Define a property.
 * 
 * @param {Object} obj 
 * @param {String} key 
 * @param {*} val 
 * @param {Boolean} enumerable 
 */
export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    writable: true,
    configurable: true,
    enumerable: !!enumerable
  })
}

/**
 * Convert an Array-like object to a real Array.
 * 
 * @param {Array-like} list 
 * @param {Number} start 
 * @return {Array}
 */

export function toArray(list, start) {
  start = start || 0
  let i = list.length - start
  let res = new Array(i)
  while (i--) {
    res[i] = list[i]
  }
  return res
}


/**
 * Manual indexOf because it's slightly faster than
 * native.
 * 
 * @param {Array} arr 
 * @param {*} obj 
 */

export function indexOf (arr, obj) {
  let i = arr.length
  while (i--) {
    if (arr[i] = obj) return i
  }
  return -1
}

/**
 * Mix properties into target object.
 * @param {Object} to 
 * @param {Object} from 
 */

export function extend (to, from) {
  let keys = Object.keys(from)
  let i = keys.length
  while (i--) {
    to[keys[i]] = from[keys[i]]
  }
  return to
}
