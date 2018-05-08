class Observer {
  constructor (value) {
    this.value = value
    this.walk(value)

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
    this.subs.forEach(sub => sub.update())
  }
}
Dep.target = null

let uid = 0
class Watcher {
  constructor (obj, getter, cb) {
    this.obj = obj
    this.getter = getter
    this.cb = cb
    this.deps = []
    this.id = ++uid
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
    const oldValue = this.value
    this.value = newValue
    this.cb.call(this.obj, newValue, oldValue)
  }
  // 清除当前watcher
  teardown () {
    this.deps.forEach(dep => dep.removeSub(this))
    this.deps = []
  }
}

function defineReactive (obj, key, val) {
  let dep = new Dep()
  observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.target) {
        dep.addSub(Dep.target)
        Dep.target.addDep(dep)
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

let obj = {
  num1: 1,
  num2: 2
}
observe(obj)

let watcher1 = new Watcher(obj, function () {
  return this.num1 + this.num2
}, function (newVal, oldVal) {
  console.log(`${this.num1} + ${this.num2} = ${newVal}`)
})

obj.num1 = 11