export function protoAugment (target, src, keys) {
  target.__proto__ = src
}

export function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    Object.defineProperty(target, key, {
      value: src[key],
      enumerable: true,
      configurable: true,
      writable: true
    })
  }
}