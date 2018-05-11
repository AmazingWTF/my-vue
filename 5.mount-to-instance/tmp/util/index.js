export const isArray = Array.isArray

export const assign = Object.prototype.assign

export const noop = function () {}

export const def = function (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

// 处理参数不定时bind的绑定问题(bind绑定，参数会变成伪数组)
// 源码中说因为更快，so.. whatever
export function bind (fn, ctx) {
  return function (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
}