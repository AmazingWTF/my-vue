// walk 遍历对象 执行 defineReactive
// Observer 在对象上绑定 __ob__ 
// Dep 依赖收集 
// Watcher 监听依赖变化，执行回调
// defineReactive 将对象的每一个键都定义成为响应依赖收集

let arrayProto = Array.prototype
let arrayMethods = Object.create(arrayProto)
let methodKeys = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'splice',
  'sort'
]


class Observer {
  constructor (obj) {
    this.value = obj
    if (Array.isArray(obj)) {
      this.dep = new Dep()
      let augment = ('__proto__' in {}) ? protoAugment : copyAugment
      augment(obj, arrayMethods, methodKeys)
      this.observeArray(obj)
    } else {
      this.walk(obj)
    }

    Object.defineProperty(obj, '__ob__', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: this
    })
  }

  walk (obj) {
    let keys = Object.keys(obj)
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

function protoAugment (target, src, keys) {
  target.__proto__ = src
}

function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    Object.defineProperty(target, keys[i], {
      value: src[keys[i]],
      enumerable: true,
      configurable: true,
      writable: true
    })
  }
}

function observe (obj) {
  if (typeof obj !== 'object') {
    return
  }
  let ob
  if (obj.__ob__ && obj.__ob__ instanceof Observer) {
    ob = obj.__ob__
  } else if (Object.isExtensible(obj)) {
    ob = new Observer(obj)
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
// 全局变量，用于存放当前进行收集的依赖
Dep.target = null

class Watcher {
  constructor (obj, getter, cb) { // 用getter而不用key(函数调用而不是 键-值 调用)，因为依赖一般都是一个函数
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
  teardown () {
    this.deps.forEach(dep => dep.removeSub(this))
    this.deps = []
  }
  update () {
    const value = this.getter.call(this.obj)
    const oldValue = this.value // 这一步执行了依赖收集
    this.cb.call(this.obj, value, oldValue) // 这一步执行回调
    this.value = value
  }
}

// get中分开处理是因为，对象可以形成闭包，直接用dep里面的数据
// 但是数组不可以直接使用getter/setter(和数组length可变有关)，所以不能直接沿用对象的处理
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
        // 子项是数组
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



// 添加数组支持
// 重写方法，原来的方法加上notify

methodKeys.forEach(method => {
  const original = arrayProto[method]
  const mutator = function (...args) {
    const result = original.apply(this, args)
    let ob = this.__ob__
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
    ob.deps.notify()
    return result
  }

  Object.defineProperty(arrayMethods, method, {
    enumerable: false,
    configurable: true,
    writable: true,
    value: mutator
  })
})




let obj = {
  num1: 1,
  num2: 2,
  inner: [
    'arr1', 'arr2'
  ]
}

observe(obj)

let watcher1 = new Watcher(obj, function () {
  return this.num1 + this.num2 + this.inner[0]
}, function (newVal, oldVal) {
  console.log(`watcher1回调执行，${this.num1} + ${this.num2} + ${this.inner[0]} = ${newVal}`)
})

let watcher2 = new Watcher(obj, function () {
  return this.num1 + this.num2 + this.inner[1]
}, function (newVal, oldVal) {
  console.log(`watcher2回调执行，${this.num1} + ${this.num2} + ${this.inner[1]} = ${newVal}`)
})

// watcher1.teardown()

obj.num1 = 11