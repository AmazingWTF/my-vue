var _       = require('./util'),
    Compiler = require('./compiler/compiler')

/**
 * the exposed Vue constructor
 * 
 * @constructor
 * @public
 */

function Vue (options) {
  this._compiler = new Compiler(this, options)
}

// mixin instance methods
var p = Vue.prototype
_.mixin(p, require('./instance/lifecycle'))
_.mixin(p, require('./instance/data'))
_.mixin(p, require('./instance/dom'))
_.mixin(p, require('./instance/events'))

// mixin asset registers
_.mixin(Vue, require('./api/api-asset-register'))

// static methods
// 实例本身的方法，因为 module.exports 只会导出 Vue 构造函数，原型对象的方法在外界无法访问，所以原型中放的都是私有方法，不向外暴露
Vue.config = require('./api/config')
Vue.require = require('./api/require')
Vue.use = require('./api/use')
Vue.extend = require('./api/extend')
Vue.nextTick = require('./util').nextTick

module.exports = Vue