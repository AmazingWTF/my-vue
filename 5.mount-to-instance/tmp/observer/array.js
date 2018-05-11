// 拦截数组方法，进行依赖收集

const arrayProto = Array.prototype
let arrayMethods = Object.create(arrayProto)

;[
  'push',
  'unshift',
  'pop',
  'shift',
  'splice',
  'sort',
  'reverse'
]
.forEach(method => {
  let mutator = function (...args) {
    const original = arrayProto[method]
    const result = original.apply(this, args)
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    this.__ob__.dep.notify()
    // return result
  }

  Object.defineProperty(arrayMethods, method, {
    value: mutator,
    enumerable: true,
    configurable: true,
    writable: true
  })
})

export default arrayMethods