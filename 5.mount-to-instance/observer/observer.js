import Dep from './Dep'
import isArray from '../util/index'
import { protoAugment, copyAugment } from '../augment/index'

let arrayProto = Array.prototype
let arrayKeys = [
  'push',
  'unshift',
  'shift',
  'pop',
  'splice',
  'reverse',
  'sort'
]

const arrayMethods = Object.create(arrayProto)
arrayMethods.forEach(method => {
  let mutator = function (...args) {
    let original = arrayMethods[method]
    const result = original.apply(this, args)
    let sorted
    switch (method) {
      case 'push':
      case 'unshift':
        sorted = args
        break
      case 'splice':
        sorted = args.slice(2)
        break
    }
    
  }

  Object.defineProperty(arrayMethods, method, {
    value: mutator,
    configurable: true,
    enumerable: false,
    writable: true
  })
})


export class Observer {
  constructor (value) {
    this.value = value
    if (isArray(value)) {
      // 数组依赖处理
      this.dep = new Dep()
      const augment = ('__proto__' in {}) ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }

    Object.defineProperty(value, '__ob__', {
      value: this,
      writable: true,
      configurable: true,
      enumerable: false
    })
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0, l = keys.length; i < l; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

export default function observe (value) {
  if (typeof value !== 'object') {
    return
  }
  let ob
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    if (Object.isExtensible(value)) {
      ob = new Observer(value)
    }
  }
  return ob
}

export function defineReactive (obj, key, val) {
  let dep = new Dep()
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.target) {
        dep.addSub(Dep.target)
        Dep.target.addDep(dep)
        if (isArray(val)) {
          childOb.dep.addSub(Dep.target)
          Dep.target.addDep(childOb.dep)
        }
      }
      return val
    },
    set (newVal) {
      if (newVal !== val) {
        val = newVal
        dep.notify()
      }
    }
  })
}