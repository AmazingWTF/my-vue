import { warn, makeMap } from '../util/index'

let hasProxy, proxyHandlers, initProxy

const allowedGlobals = makeMap(
  'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,' + 
  'parseInt,decodeURI,decodeURIComponent,encodeURI,' +
  'encodeURIComponent,Math,Number,Date,Array,Object,' +
  'Boolean,String,RegExp,Map,Set,JSON,Intl,require'
)

hasProxy = typeof Proxy !== 'undefined' && Proxy.toString.match(/native code/)

proxyHandlers = {
  has(target, key) {
    const has = key in target
    const isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
    if (!has && !isAllowed) {
      warn(
        `Property or method "${key}" is not defined on the instance but
        referenced during render. Make sure to declare reactive data
        properties in the data option.`,
        target
      )
    }
    return has || !isAllowed
  }
}

initProxy = function initProxy (vm) {
  if (hasProxy) {
    vm._renderProxy = new Proxy(vm, proxyHandlers) // 拦截 in 操作符(属性是否存在vm中)
  } else {
    vm._renderProxy = vm
  }
}

export { initProxy }