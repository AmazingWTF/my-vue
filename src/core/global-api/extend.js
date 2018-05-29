import config from '../config'
import {
  warn,
  mergeOptions
} from '../util/index'

export function initExtend (Vue) {
  // 每个实例构造函数，包括Vue，都有一个唯一cid，这个cid
  // 使我们能够用原型继承创建子构造函数并且缓存他们
  Vue.cid = 0
  let cid = 1

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    const Super = this
    const isFirstExtend = Super.cid === 0 // 判断是否为首次extend
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor
    }
    let name = extendOptions.name || Super.options.name
    if (!/^[a-zA-Z][\w-]*$/.test(name)) {
      warn(
        'Invalid component name: "' + name + '". Component names ' +
        'can only contain alphanumeric characaters and the hyphen.'
      )
      name = null
    }
    const Sub = function VueComponent(options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(Super.options, extendOptions)
    Sub['super'] = Super
    // 可以继续向下扩展
    Sub.extend = Super.extend
    // 创建一个资源暂存器，以实现extend出来的类也有自己
    // 私有的 asset
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
    // 拓展的时候保持对super的options属性的引用
    // 稍后实例化的时候可以检测super的options是否发生更新
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    // 缓存构造函数
    if (isFirstExtend) {
      extendOptions._Ctor = Sub
    }
    return Sub
  }
}