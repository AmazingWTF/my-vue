var _       = require('./util'),
    Compiler = require('./compiler/compiler')

/**
 * the exposed Vue constructor
 * 
 * @constructor
 * @param {Object} options
 * @public
 */

function Vue (options) {
  this._compiler = new Compiler(this, options)
}

/**
 * Mixin instance methods
 */

var p = Vue.prototype
_.mixin(p, require('./instance/lifecycle'))
_.mixin(p, require('./instance/data'))
_.mixin(p, require('./instance/dom'))
_.mixin(p, require('./instance/events'))

/**
 * Mixin asset registers
 */

_.mixin(Vue, require('./api/api-asset-register'))

/**
 * Static methods
 */
Vue.config = require('./api/config')
Vue.require = require('./api/require')
Vue.use = require('./api/use')
Vue.extend = require('./api/extend')
Vue.nextTick = require('./util').nextTick

module.exports = Vue