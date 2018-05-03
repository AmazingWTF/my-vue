
/**
 * @param {Function} target - 用于存放需要添加的依赖
 * 
 * @property {Array} subs - 用于存放依赖
 * @property {Function} addSub - 用于添加依赖
 * @property {Function} removeSub - 用于移除依赖
 * @property {Function} notify  - 用于执行依赖
 */

let Dep = function () {
  this.subs = []

  this.addSub = function (sub) {
    this.subs.push(sub)
  }
  this.removeSub = function (sub) {
    const index = this.subs.indexOf(sub)
    if (index > -1) {
      this.subs.splice(index, 1)
    }
  }
  this.notify = function () {
    this.subs.forEach(watcher => watcher.update())
  }
}
Dep.target = null


let Watcher = function (obj, key, cb) {
  this.obj = obj
  this.getter = key
  this.cb = cb
  this.dep = null
  this.value = undefined

  this.get = function () {
    Dep.target = this
    let value = this.obj[this.getter]
    Dep.target = null 
    return value
  }

  this.update = function () {
    const value = this.obj[this.getter]
    const oldVal = this.value
    this.value = value
    this.cb.call(this.obj, value, oldVal)
  }

  this.addDep = function (dep) {
    this.dep = dep
  }

  this.value = this.get()
}

/**
 * 创建闭包，在getter中为deps(依赖)添加subs(订阅)，为全局的Dep.target添加dep
 * 在setter中执行所有subs
 * @param {*} obj 
 * @param {*} key 
 * @param {*} val 
 */
function defineReactive (obj, key, val) {
  let dep = new Dep()
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: function () {
      if (Dep.target) {
        dep.addSub(Dep.target)
        // 添加 watcher 对 dep 的引用
        Dep.target.addDep(dep)
      }
      return val
    },
    set: function (newVal) {
      if (newVal !== val) {
        val = newVal
        dep.notify()
      }
    }
  })
}

// Dep.target = function (newVal, oldVal) {
//   console.log(`我被添加进去了，新的值是：${newVal}`)
// }

let obj = {}

defineReactive(obj, 'test', 'test')

let watcher1 = new Watcher(obj, 'test', function (newVal, oldVal) {
  console.log('watcher的首个函数。新值改变为：' + newVal)
})
obj.test = 'change1'

// console.log(obj)