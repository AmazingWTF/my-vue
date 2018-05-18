
export const hasProto = '__proto__' in {}


export const inBrowser =
                        typeof window !== 'undefined' &&
                        Object.prototype.toString.call(window) !== '[object Object]'

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && UA.indexOf('trident') > 0
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isAndroid = UA && UA.indexOf('android') > 0
export const isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA)
export const iosVersionMatch = isIos && UA.match(/os ([\d_]+)/)
export const iosVersion = iosVersionMatch && iosVersionMatch[1].split('_')

// detecting IOS UIWebView by indexDB
export const hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1] >= 3 && !window.indexedDB)

/**
 * 推迟一个任务异步执行它,理想状态下应该作为microtask执行,
 * 如果MutationObserver可用的话就使用它,否则就用setTimeout(0)
 * (使用闭包存储callbacks,在每次调用nextTick都使用同一个callbacks)
 * 
 * @param {Function} cb
 * @param {Object} ctx
 */

export const nextTick = (function () {
  let callbacks = []
  let pending = false
  let timerFunc

  function nextTickHandler () {
    pending = false
    // 复制一份的原因是因为有的cb执行过程中会往callbacks中添加内容
    // 比如$nextTick的回调中又有$nextTick
    // 应该放到下一轮nextTick中执行的
    const copies = callbacks.slice(0)
    callbacks = []
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    let counter = 1
    const observer = new MutationObserver(nextTickHandler)
    const textNode = document.createTextNode(counter)
    // 调用MutationObserver的接口,观测文本节点的字符内容
    observer.observe(textNode, {
      characterData: true
    })
    // 每次执行timerFunc都会让文本节点的内容在0/1之间切换,
    // 切换之后将新值赋值到用MutationObserver观测的那个文本节点上面
    // 此操作将会触发MutationObserver收到DOM变化消息,从而执行回调
    timerFunc = function () {
      counter = (counter +1) % 2
      textNode.data = counter
    }
  } else {
    const context = inBrowser
      ? window
      : typeof global !== 'undefined' ? global : {}
    timerFunc = context.setImmediate || setTimeout
  }
  return function (cb, ctx) {
    const func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(nextTickHandler, 0)
  }
})()


let _Set
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  _Set = Set
} else {
  _Set = class _Set {
    constructor () {
      this.set = Object.create(null)
    }
    has (key) {
      return this.set[key] !== undefined
    }
    add (key) {
      this.set[key] = 1
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}

export { _Set }