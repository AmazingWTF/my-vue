import Dep from './observer/Dep'
import Watcher from './wather'
import observe from './observer/observer'
import { 
  noop,
  mergeOptions
 } from './util/index'
import Computed from './computed/computed'
import Event from './event/event'

let uid = 0

export default class Vue extends Event {
  constructor (options) {
    super()
    this._init(options)
  }
  
  _init (options) {
    let vm = this
    vm.id = uid++
    vm.$options = mergeOptions(
      vm.constructor.options,
      options,
      vm
    )
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
    this._comupted = []
    const computeds = this.$options.computed
    if (!computeds) return
    for (let key in computeds) {
      this._comupted.push(new Computed(this, key, computeds[key]))
    }
  }
}

Vue.options = {
  components: {},
  _base: Vue
}

Vue.extend = function (extendOptions) {
  const Super = this
  
  class Sub extends Super {
    constructor (options) {
      super(options)
    }
  }

  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )

  Sub.super = Super
  Sub.extend = Super.extend

  return Sub
}