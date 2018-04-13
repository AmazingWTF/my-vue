import initMixin from './internal/init'
import stateMixin from './internal/state'

/**
 * The exposed  Vue constructor.
 * 
 * API conventions:
 * - public API methods/properties are prefixed with '$'
 * - internal API methods/properties are prefixed with '_'
 * - non-prefixed properties are assumed to be profixed user
 *   data.
 * 
 * @param {Object} options 
 */

function Vue (options) {
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)

export default Vue