var _ = require('./util')

/**
 * the exposed Vue constructor
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue (options) {
  this._init(options)
}

var p = Vue.prototype

/**
 * Define prototype properties.
 */

require('./internal/properties')(p)

/**
 * Mixin internal instance methods.
 */

_.mixin(p, require('./internal/init'))
_.mixin(p, require('./internal/compile'))

/**
 * Mixin API instance methods.
 */

_.mixin(p, require('./aip/data'))
_.mixin(p, require('./aip/dom'))
_.mixin(p, require('./aip/events'))
_.mixin(p, require('./aip/lifecycle'))

/**
 * Mixin global API.
 */

_.mixin(Vue, require('./api/global'))

module.exports = Vue