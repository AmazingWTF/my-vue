

import { noop } from '../../shared/util'

export const hasProto = '__proto__' in {}

export const inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]'

export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = UA && UA.indexOf('android') > 0
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)

export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

// 检测是否为原生
function isNative (Ctor) {
  return (/native code/.test(Ctor.toString()))
}

export const nextTick = function () {
  const callbacks = []
  let pending = false
  let timerFunc

  // nextTick的处理函数
  function nextTickHandler () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0, l = copies.length; i < l; i++) {
      copies[i]()
    }
  }

  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    let p = Promise.resolve()
    timerFunc = () => {
      p.then(nextTickHandler)
      // 在一些有问题的环境中，Promise.then不会完全破坏，而是表现为
      // 一种`可以添加到microtask队列中，但是在浏览器需要执行其他操作之前
      // 队列不会完全执行并清空`的奇怪的状态中(e.g. 可以用一个定时器来处理)
      // 因此我们可以用一个空的定时器来促使清空microtask队列
      if (isIOS) setTimeout(noop)
    }
  } else if (typeof MutationObserver !== 'undefined' && (isNative(MutationObserver) ||
  // PhantomJS and IOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]')) {
    
    let counter = 1
    let observer = new MutationObserver(nextTickHandler)
    let textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = () => {
      counter = (counter + 1) % 2
      textNode.data = String(counter)
    }
  } else {

    timerFunc = setTimeout
  }

  return function queueNextTick (cb, ctx) {
    const func = ctx ? function () {
      cb.call(ctx)
    } : cb
    callbacks.push(func)
    if (!pending) {
      pending = true
      timerFunc(nextTickHandler, 0)
    }
  }
}()

let _Set

if (typeof Set !== 'undefined' && isNative(Set)) {
  _Set = Set
} else {
  _Set = class Set {
    constructor () {
      this.set = Object.create(null)
    }
    has(key) {
      return this.set[key] !== undefined
    }
    add (key) {
      return this.set[key] = 1
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}

export { _Set }