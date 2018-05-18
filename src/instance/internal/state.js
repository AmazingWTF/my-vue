import Dep from '../../observer/dep'
import {
  observe,
  defineReactive
} from '../../observer/index'
import {
  warn,
  hasOwn,
  isPlainObject,
  bind
} from '../../util/index'

export default function (Vue) {
  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

   Object.defineProperty(Vue.prototype, '$data', {
     get () {
       return this._data
     },
     set (newData) {
       if (newData !== this._data) {
         this._setData(newData)
       }
     }
   })


   Vue.prototype._initState = function () {
    //  this._initProps()
    //  this._initMeta()
    //  this._initMethods()
     this._initData()
    //  this._initComputed()
   }

   Vue.prototype._initData = function () {
     const dataFn = this.$options.data
      let data = this._data = dataFn ? dataFn() : {}
      if (!isPlainObject(data)) {
        data = {}
      }
      const props = this._props
      // proxy data on instance
      const keys = Object.keys(data)
      let i, key
      i = keys.length
      while (i--) {
        key = keys[i]
        // there are two scenarious where we can proxy a data key:
        // 1. it's not already defined as a prop
        // 2. it's provided via a instantiation option and there are
        //    no template prop present
        if (!props || !hasOwn(props, key)) {
          // 讲data代理到vm，实现vm.prop === vm._data.prop
          // 比如v-for指令会为数组的每一个元素创建一个scope，这个scope继承自
          // vm或上级数组元素的scope，这样就可以在v-for作用域中访问父级数据
          this._proxy(key)
        } else {
          warn(
            'Data field "' + key + '" is already defined ' +
            'as a prop. To provide default value for a prop, use the "default" ' +
            'prop option; if you want to pass prop values to an instantiation ' +
            'call, use the "propsData" option.',
            this
          )
        }
      }
      // observe data
      observe(data, this)
   }

   /**
    * Swap the instance's $data. Called in $data's setter.
    * 
    * @param {Object} newData 
    */
   Vue.prototype._setData = function (newData) {
     newData = newData || {}
     let oldData = this._data
     this._data = newData
     let keys, key, i
    // unproxy keys not present in new data
     keys = Object.keys(oldData)
     i = keys.length
     while (i--) {
       key = keys[i]
       if (!(key in newData)) {
         this._unproxy(key)
       }
     }

     keys = Object.keys(newData)
     i = keys.length
     while (i--) {
       key = keys[i]
       if (!hasOwn(this, key)) {
         // new property
         this._proxy(key)
       }
     }
     oldData.__ob__.removeVm(this)
     observe(newData, this)
     this._digest()
   }
}