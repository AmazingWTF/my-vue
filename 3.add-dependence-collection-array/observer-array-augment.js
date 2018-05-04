// 添加对数组的监听（observer完成版）
const methodsToPath = [
  'push',
  'pop',
  'splice',
  'shift',
  'unshift',
  'sort',
  'reverse'
]


// 实现监听数组变化
class Observer {
  constructor (value) {
    this.value = value
    if (Array.isArray(value)) {
      this.dep = new Dep()
      const augment = ('__proto__' in {}) ? protoAugment : copyAugment
      augment(value, arrayMethods, methodsToPath)
      this.observeArray(value)
    } else {
      this.walk(value)
    }

    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false,
      configurable: true,
      writable: true
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

// 拥有__proto__属性，重写__proto__属性 
function protoAugment (target, src, keys) {
  target.__proto__ = src
}

// 没有实现__proto__属性，直接定义在对象身上
function copyAugment (target, src, keys) {
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

function observe (value) {
  if (typeof value !== 'object') {
    return
  }
  let ob
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (Object.isExtensible(value)) {
    ob = new Observer(value)
  }
  return ob
}

class Dep {
  constructor () {
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }
  removeSub (sub) {
    const index = this.subs.indexOf(sub)
    if (index > -1) {
      this.subs.splice(index, 1)
    }
  }
  notify () {
    this.subs.forEach(watcher => watcher.update())
  }
}
Dep.target = null

class Watcher {
  constructor (obj, getter, cb) {
    this.obj = obj
    this.getter = getter
    this.cb = cb
    this.deps = []
    this.value = this.get()
  }

  get () {
    Dep.target = this
    const value = this.getter.call(this.obj)
    Dep.target = null
    return value
  }

  addDep (dep) {
    this.deps.push(dep)
  }

  update () {
    const newValue = this.getter.call(this.obj)
    const value = this.value
    this.cb.call(this.obj, newValue, value)
  }

  teardown () {
    this.deps.forEach(dep => dep.removeSub(this))
    this.deps = []
  }
}

function defineReactive (obj, key, val) {
  let dep = new Dep()
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.target) {
        dep.addSub(Dep.target)
        Dep.target.addDep(dep)
        // 处理数组的依赖
        if (Array.isArray(val)) {
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


// 劫持数组方法
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

// const methodsToPath = [
//   'push',
//   'pop',
//   'splice',
//   'shift',
//   'unshift',
//   'sort',
//   'reverse'
// ]

methodsToPath.forEach(method => {
  const original = arrayProto[method]
  let mutator = function (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
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
    if (inserted) ob.observeArray(inserted)
    ob.dep.notify()
    return result 
  }
  Object.defineProperty(arrayMethods, method, {
    value: mutator,
    enumerable: false,
    writable: true,
    configurable: true
  })
})

let obj = {
  name: 'test',
  arr: [1, 3, 9, 5, {
    name: 'arr-inner'
  }]
}

observe(obj)

let watcher1 = new Watcher(obj, function () {
  return this.arr.filter(e => typeof e === 'number' && e).reduce((sum, num) => sum + num)
}, function (newVal, oldVal) {
  console.log(`watcher1改变 和为：${newVal} \n`)
})


obj.arr.push(2)