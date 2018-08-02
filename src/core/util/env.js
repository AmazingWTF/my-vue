
import { noop } from '../.../shared/util'

// can we use __proto__?
export const hasProto = '__proto__' in {}

// Browser enviroment sniffing
export const inBrowser = 
  typeof window !== 'undefined'
    && Object.prototype.toString.call(window) !== '[object Object]'

export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = UA && UA.indexOf('android') > 0
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

function isNative (Ctor) {
  return (/native code/.test(Ctor.toString()))
}

/**
 * Defer a task to execute it asynchronously.
 */
export const nextTick = function () {
  const callbacks = []
  let pending = false
  let timerFunc

  function nextTickHandler () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  // the nextTick behavior leverages the microtask queue. which can be accessd
  // via either native Promise.then or MutationObserver.
  // MutataionObserver has wider support, however it is seriously bugged in
  // UIWebView in IOS >= 9.3.3 when triggered in touch evnet handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is avaliable, we will use it:
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve()
    timerFunc = () => {
      p.then(nextTickHandler)
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // 'force' the microtask queue to be flushed by adding an empty timer.
      if (isIOS) setTimeout(noop)
    }
  } else if (
    typeof MutationObserver !== 'undefined' && (isNative(MutationObserver)
    || MutationObserver.toString() === '[object MutationObserverConstructor]')
  ) {
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(String(counter))
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