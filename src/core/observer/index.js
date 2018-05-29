import config from '../config'
import Dep from '/dep'
import { arrayMethods } from './array'
import {
  def,
  isObject,
  isPlainObject,
  hasProto,
  hasOwn,
  warn
} from '../util/index'
import { prototype } from 'module';

// getOwnPropertyNames 可以获取enumerable为false的属性名，keys不能(非继承属性)
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)


export const observerState = {
  shouldConvert: true,
  isSettingProps: false
}

export class Observer {

  constructor (value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
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



function protoAugment (target, src) {
  target.__proto__ = src
}


function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}


export function observe (value) {
  if (!isObject(value)) {
    return
  }
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
      observerState.shouldConvert &&
      !config._isServer &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
  ) {
    ob = new Observer(value)
  }
  return ob
}


export function defineReactive (obj, key, val, customSetter) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  const getter = property && property.get
  const setter = property && property.set

  let childOb = observe(val)
  Object.defineProperty(obj, val, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
        if (Array.isArray(value)) {
          for (let e, i = 0, l = value.length; i < l; i++) {
            e = value[i]
            e && e.__ob__ && e.__ob__.dep.depend()
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value) {
        return
      }
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = observe(newVal)
      dep.notify()
    }
  })
}


export function set (obj, key, val) {
  if (Array.isArray(obj)) {
    obj.splice(key, 1, val)
    return val
  }
  if (hasOwn(obj, key)) {
    obj[key] = val
    return
  }
  const ob = obj.__ob__
  if (obj._isVue || ob && ob.vmCount) {
    process.env.NODE_ENV !== 'production' && 
      warn('Avoid adding reactive properties to a Vue instance or its '+ 
        'root $data at runtime - declare it upfront in the data option.')
    return
  }
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key]
  if (!ob) return
  ob.dep.notify()
}
