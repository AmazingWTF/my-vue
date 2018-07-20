import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import platformDirectives from '../platforms/web/runtime/directives/index'
import { query, isUnknownElement, isReservedTag, getTagNamespace, mustUseProp } from '../entries/web/util/index'

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// // install platform patch function
// Vue.prototype.__patch__ = config._isServer ? noop : path

// // wrap mount
// Vue.prototype.$mount = function (el, hydrating) {
//   el = el && !config._isServer ? query(el) : undefined
//   return this._mount(el, hydrating)
// }

export default Vue