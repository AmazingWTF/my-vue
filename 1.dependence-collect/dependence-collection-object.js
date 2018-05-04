/**
 * Dependency collection for pure Object.
 * 
 * 基本原理就是劫持对象，在取值和修改的时候触发对应的回调
 */

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

class Watcher {
  constructor (obj, getter, cb) {
    this.obj = obj
    this.getter = getter
    this.cb = cb
    this.deps = []
    this.value = this.get()
  }

  // 开始依赖收集
  get () {
    Dep.target = this
    const value = this.getter.call(this.obj) // 执行依赖收集
    Dep.target = null
    return value
  }

  addDep (dep) {
    this.deps.push(dep)
  }

  update () {
    const value = this.getter.call(this.obj)
    const oldValue = this.value
    this.cb.call(this.obj, value, oldValue)
  }

  // 取消当前watcher
  teardown () {
    this.deps.forEach(dep => dep.removeSub(this))
    this.deps = []
  }
}

function defineReactive (obj, key, val) {
  let dep = new Dep()
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

let obj = {}

defineReactive(obj, 'num1', 2)
defineReactive(obj, 'num2', 3)


let watcher1 = new Watcher(obj, function () {
  return this.num1 + this.num2
}, function (newVal, val) {
  console.log(`watcher1回调触发，${obj.num1} + ${obj.num2} = ${newVal}`)
})

let watcher2 = new Watcher(obj, function () {
  return this.num1 * this.num2
}, function (newVal, val) {
  console.log(`watcher2回调触发，${obj.num1} * ${obj.num2} = ${newVal} \n`)
})

obj.num1 = 8

watcher1.teardown()

obj.num1 = 11