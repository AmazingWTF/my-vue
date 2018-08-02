// Only for development environment

import { warn, makeMap } from '../util/index'

let hasProxy, proxyHandlers, initProxy

if (process.env.NODE_ENV !== 'production') {
  const allowedGlobals = makeMap(
    'Infinity, undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,' +
    'encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,' +
    'RegExp,Map,Set,JSON,Intl,require' // for Webpack/Browserify
  )

  hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/)

  proxyHandlers = {
    has (target, key) {
      const has = key in target
      const isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
      if (!has && !isAllowed) {
        warn('属性不存在或者是保留属性')
      }
      return has || !isAllowed
    }
  }

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      vm._renderProxy = new Proxy(vm, proxyHandlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

export { initProxy }