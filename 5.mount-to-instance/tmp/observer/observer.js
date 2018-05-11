import Dep from '../observer/Dep'
import arrayMethods from './array'
import {
  def,
  isArray
} from '../util/index'

let uid = 0

class Observer {
  constructor (value) {
    this.value = value
    this.id = uid++
    if (isArray(value)) {
      this.dep = new Dep()
      let augment = ('__proto__' in {})
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods)
      this.observeArray(value)
    } else {
      this.walk(value)
    }

    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: true,
      configurable: true,
      writable: true
    })
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i]
      defineReactive(obj, key, obj[key])
    }
  }

  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function protoAugment (target, src) {
  target.__proto__ = src
}

function copyAugment (target, src) {
  for (let k in src) {
    def(target, k, src[k])
  }
}

export default function observe (value) {
  if (typeof value !== 'object') return
  let ob
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}

function defineReactive (obj, key, val) {
  let dep = new Dep()
  // 将属性值observe，如果是复杂类型，返回一个Observer实例
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.target) {
        dep.addSub(Dep.target)
        Dep.target.addDep(dep)
        if (isArray(val)) {
          // key的值是数组，所以数组
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