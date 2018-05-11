import Dep from './observer/Dep'
import Watcher from './wather'
import observe from './observer/observer'
import { noop } from './util/index'
import Computed from './computed/computed'
import Event from './event/event'

let uid = 0

export default class Vue extends Event {
  constructor (options) {
    super()
    this.id = uid++
    this.$options = options
    this._init()
  }

  _init () {
    this._initData()
    this._initWatch()
    this._initComputed()
  }

  _initData () {
    let _data = this.$options.data
    observe(_data)
    for (let k in _data) {
      Object.defineProperty(this, k, {
        enumerable: true,
        configurable: true,
        get () {
          return _data[k]
        },
        set (newVal) {
          _data[k] = newVal
        }
      })
    }
  }

  _initWatch () {
    this._watch = []
    const watch = this.$options.watch
    if (!watch) return
    for (let key in watch) {
      const keys = key.split('.')
      let watcher = new Watcher(this, function () {
        return keys.reduce((r, k) => r[k], this)
      }, watch[key])
      this._watch.push(watcher)
    }
  }

  _initComputed () {
    const computeds = this.$options.computed
    if (!computeds) return
    for (let key in computeds) {
      new Computed(this, key, computeds[key])
    }
  }
}

// let obj = {
//   msg: 'hello world',
//   num1: 1,
//   num2: 2,
//   obj: {
//     name: 'test obj'
//   },
//   arr: [
//     1, 2, 3, 4
//   ]
// }

// observe(obj)

// let watcher1 = new Watcher(obj, function () {
//   return this.num1 + this.obj.name + this.num2
// }, function (newVal) {
//   console.log(`${this.num1} + ${this.obj.name} + ${this.num2} = ${newVal} \n`)
// })

// obj.num1 = 11
// obj.obj.name = 'change name'
// console.log('----------')

// let watcher2 = new Watcher(obj, function () {
//   return this.arr.reduce((sum, num) => sum + num)
// }, function (newVal) {
//   console.log(`和为：${newVal}`)
// })

// console.log(obj)

// obj.arr.push(10)
// obj.arr.pop()
// obj.arr.unshift(10)
// obj.arr.shift()
// obj.arr.splice(0, 1, 10)