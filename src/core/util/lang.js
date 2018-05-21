
// 检测字符串是否以 $ 或 _ 开头(内部方法,不暴露)
export function isReserved (str) {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5f
}

// 定义一个属性
export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

// 解析简单的路径(或者理解为一维路径)
const bailRE = /[^\w\.\$]/
export function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    const segments = path.slice('.')
    return function (obj) {
      for (let i = 0, l = segments.length; i < l; i++) {
        if (!obj) return
        obj = obj[segments[i]]
      }
      return obj
    }
  }
}
