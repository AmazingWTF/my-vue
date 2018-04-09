/**
 * Simple event emitter based on component/emitter.
 *
 * @constructor
 * @param {Object} ctx - the context to call listeners with.(监听器的上下文)
 */

function Emitter (ctx) {
  this._ctx = ctx || this
}

var p = Emitter.prototype

/**
 * Listen on the given 'event' with 'fn'
 * 为事件 event 注册监听事件，fn 为触发后执行的函数
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */
p.on = function (event, fn) {
  this._cbs = this._cbs || {}
  ;(this._cbs[event] = this._cbs[event] || [])
    .push(fn)
  return this
}

/**
 * Adds an 'event' listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */

p.once = function (event, fn) {
  var _this = this
  this._cbs = this._cbs || {}

  // 使用 on 函数作为回调，on 函数内部移除这个监听事件，以此达到 once 监听
  function on () {
    _this.off(event, on)
    fn.apply(this, arguments)
  }

  on.fn = fn
  this.on(event, on)
  return this
}

/**
 * Remove the given callback for 'event' or all
 * registered callbacks
 * 删除事件的给定回调或者所有的回调函数
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */

p.off = function (event, fn) {
  this._cbs = this._cbs || {}

  // all 
  if (!arguments.length) {
    this._cbs = {}
    return this
  }

  // specific event
  var callbacks = this._cbs[event]
  if (!callbacks) return this

  // remove all handlers
  if (arguments.length === 1) {
    delete this._cbs[event]
    return this
  }

  // remove specific handler
  var cb
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i]
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1)
      break
    }
  }
  return this
}


/**
 * The internal, faster emit with fixed amount of arguments
 * using Function.call.
 *
 * 内部，使用更快的 emit (Function.call 并且参数固定)
 *
 * @param {String} event
 * @return {Emitter}
 */

p.emit = function (event, a, b, c) {
  this._cbs = this._cbs || {}
  var callbacks = this._cbs[event]

  if (callbacks) {
    callbacks = callbacks.slice(0)
    for (let i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i].call(this._ctx, a, b, c)
    }
  }

  return this
}

/**
 * The external emit using Function.apply, used
 * by Vue instance event method
 *
 * 外部(用户)调用 emit 使用的是 Function.apply，以 Vue 实例事件方法调用 (个人理解)
 *
 * @param {String} event
 * @return {Emitter}
 */
p.applyEmit = function (event) {
  this._cbs = this._cbs || {}
  var callbacks = this._cbs[event], args

  if (callbacks) {
    callbacks = callbacks.slice(0)
    args = callbacks.slice.call(arguments, 1)
    for (var i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i].apply(this._ctx, args)
    }
  }

  return this
}


module.exports = Emitter


