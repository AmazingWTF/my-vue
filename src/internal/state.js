import {
  isPlainObject,
  warn,
  isReserved
} from '../util/index'
import {
  observe
} from '../observer/index'

export default function (Vue) {

  Object.defineProperty(Vue.prototype, '$data', {
    get() {
      return this._data
    },
    set(newData) {
      if (this._data !== newData) {
        this._setData(newData)
      }
    }
  })


  Vue.prototype._initState = function () {

    this._initData()

  }


  Vue.prototype._initData = function () {
    var dataFn = this.$options.data
    var data = this.data = dataFn ? dataFn() : {}
    if (!isPlainObject(data)) {
      data = {}
      warn('data functions should return a function')
    }

    let keys = Object.keys(data)
    let i, key
    i = keys.length
    while (i--) {
      key = keys[i]

      // 将data中的数据代理到实例上面，可以通过实例直接访问数据
      // 实现 vm.prop === vm._data.prop
      // 这样 vm 的后代实例就能够直接通过原型链访问父代的属性
      this._proxy(key)
    }
    // observe data
    observe(data, this)
  }


  Vue.prototype._proxy = function (key) {
    // 不是以 '_' 或者 '$' 开头的属性
    if (!isReserved(key)) {
      let self = this
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter () {
          return self._data[key]
        },
        set: function proxySetter (newVal) {
          self._data[key] = newVal
        }
      })
    }
  }


}