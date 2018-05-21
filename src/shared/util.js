// 将传入的值变成字符串
export function _toString (val) {
  return val === null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
}

// 转为数字,转化失败返回传入的原始值
export function toNumber (val) {
  const n = parseFloat(val, 10)
  return n || n === 0 ? n : val
}

// 创建一个map,返回检查传入的key是否存在于map中
export function makeMap (str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0, l = list.length; i < l; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

// 检查是否是内置标签
export const isBuiltInTag = makeMap('slot,component', true)

// 检查对象是否拥有此属性
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

// 检测传入值是否为简单类型值(String|Number)
export function isPrimitive (value) {
  return typeof value === 'string' || typeof value === 'number'
}

// 创建一个纯函数的缓存版本
export function cached (fn) {
  const cache = Object.create(null)
  return function cacheFn(str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

// 将连字符形式(xxx-xx)转为驼峰式,并缓存转换结果(只匹配首字母)
const camelizeRE = /-(\w)/g
export const camelize = cached(str => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

// 将首字母转为大写,缓存结果(首字母)
export const capitalize = cached(str => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

// 将驼峰命名转成连字符形式(xx-xxx)
const hyphenateRE = /([^-])([A-Z])/g
export const hyphenate = cached(str => {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
})

// 简版bind,较原生更快
export function bind (fn, ctx) {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      :fn.call(ctx)
  }
  boundFn._length = fn.length
  return boundFn
}

// 将一个伪数组转化成数组
export function toArray (list, start) {
  start = start || 0
  let i = list.length - start
  const ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

// 向目标对象中混入属性
export function extend (to, from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

// 主要用来将简单值和复杂类型区分开
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

// 判断是否是纯对象
const toString = Object.prototype.toString
const OBJECT_STRING = '[object Object]'
export function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

// 将一个数组合并到一个对象中
export function toObject (arr) {
  const res = {}
  for (let i = 0, l = arr.length; i < l; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

// 空操作
export function noop () {}

// 总是返回false
export const no = () => false

// 在编译模块过程中生成一个静态的键名字符串
export function genStaticKeys (modules) {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys, || [])
  }, []).join(',')
}

// 检测两个值是否相等(非严格相等)
export function looseEqual (a, b) {
  return a === b || (
    isObject(a) && isObject(b)
      ? JSON.stringify(a) === JSON.stringify(b)
      : false
  )
}

export function looseIndexOf (arr, val) {
  for (let i = 0, l = arr.length; i < l; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

