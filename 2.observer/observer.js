// 

/**
 * 为什么 `将遍历对象属性这个过程抽象成一个对象`(为什么有这个问题？)
 * 可能几个对象的某个属性是同一个对象的引用，如果直接函数调用的话，会多次遍历
 * 抽象成对象之后，可以判断当前对象是否存在 __ob__ 属性，防止重复遍历
 */
class Observer {
  constructor (value) {
    this.value = value
    this.walk(value)

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

}

function observe (value) {
  if (typeof value !== 'object') {
    return
  }
  let ob
  // 防止重复生成observer
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
    const value = this.getter.call(this.obj)
    const oldValue = this.value
    this.value = value
    this.cb.call(this.obj, value, oldValue)
  }
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
      // 是依赖收集触发的get
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


// let obj = {}
// defineReactive(obj, 'num1', 3)
// defineReactive(obj, 'num2', 5)

// let watcher1 = new Watcher(obj, function () {
//   return this.num1 + this.num2
// }, function (newVal, oldVal) {
//   console.log(`watcher1回调触发 ${this.num1} + ${this.num2} = ${newVal}`)
// })

// let watcher2 = new Watcher(obj, function () {
//   return this.num1 * this.num2
// }, function (newVal, oldVal) {
//   console.log(`watcher2回调触发 ${this.num1} * ${this.num2} = ${newVal} \n`)
// })

// obj.num1 = 5

// watcher1.teardown()

// obj.num1 = 11



let obj = {
  num1: 1,
  num2: 2,
  child: {
    num3: 3
  }
}

observe(obj)

let watcher = new Watcher(obj, function () {
  return (this.num1 + this.num2 + this.child.num3)
}, function (newVal, oldVal) {
  console.log(`${this.num1} + ${this.num2} + ${this.child.num3} = ${newVal}`)
})

// let watcherInner = new Watcher(obj.child, function () {
//   return `${this.name}: ${this.age}`
// }, function (newVal, oldVal) {
//   console.log('watcherInner回调执行：' + newVal)
// })

obj.num1 = 10

obj.child.num3 = 100