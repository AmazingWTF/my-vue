var _ = require('../util')
var Observer = require('../observe/observer')
var scopeEvents = ['set', 'mutate', 'added', 'deleted', 'added:self', 'deleted:self']

/**
 * Kick off the initialization process on the instance creation.
 *
 * @param {Object} options
 * @private
 */

exports._init = function (options) {
  this.$options = options = options || {}
  // create scope
  this._initScope(options)
  // setup initial data
  this._initData(options.data || {}, true)
  // setup property proxy
  this._initProxy()
}


/**
 * Setup scope and listen to parent scope changes.
 * Only called once during _init().
 *
 * @param {Object} options
 * @private
 */

exports._initScope = function (options) {
  var parent = this.$parent = options.parent
  var scope = this._scope = parent && options._inheritScope !== false
    ? Object.create(parent._scope)
    : {}
  // create scope observer
  this._observer = Observer.create(scope, {
    callbackContext: this,
    doNotAlterProto: true
  })

  if (!parent) return

  // relay change events that sent down from
  // the scope prototype chain.
  // 传递从原型链中发送下来的事件
  var ob = this._observer
  var pob = parent._observer
  var listeners = this._scopeListeners = {}
  scopeEvents.forEach(function (event) {
    var cb = listeners[event] = function (key, a, b) {
      // since these events come from upstream,
      // we only emit them if we don't have the same keys
      // shadowing them in current scope.
      // 因为这些事件来自上级，所以如果当前 scope 如果没有对应的键，
      // 就只能 emit 它们
      if (!scope.hasOwnProperty(key)) {
        ob.emit(event, key, a, b)
      }
    }
    pob.on(event, cb)
  })
}


exports._initData = function (data, init) {
  var scope = this._scope

  if (!init) {
    // teardown old sync listeners.
    this._unsync()
    // delete keys not present in the new data.
    for (var key in scope) {
      if (scope.hasOwnProperty(key) && !(key in data)) {
        scope.$delete(key)
      }
    }
  }

  // copy instantiation data into scope
  for (var key in data) {
    if (scope.hasOwnProperty(key)) {
      // existing property, trigger set
      scope[key] = data[key]
    } else {
      // new property
      scope.$add(key, data[key])
    }
  }

  // sync scope and new data.
  this._data = data
  this._dataObserver = Observer.create(data)
  this._sync()
}

/**
 * Proxy the scope properties on the instance itself.
 * So that vm.a = vm._scope.a
 * @private
 */

exports._initProxy = function () {
  // proxy every scope property on the instance itself
  var scope = this._scope
  for (var key in scope) {
    _.proxy(this, scope, key)
  }
  // keep proxy up-to-date with the added/deleted keys.
  this._observer
    .on('added:self', function (key) {
      _.proxy(this, scope, key)
    })
    .on('deleted:self', function (key) {
      delete this[key]
    })
}

/**
 * Setup two-way sync between the instance scope and
 * the original data. Requires teardown.
 *
 * @private
 */

exports._sync = function () {
  var data = this.data
  var scope = this._scope
  var locked = false

  var listeners = this._syncListeners = {
    data: {
      set: guard(function (key, val) {
        data[key] = val
      }),
      added: gurad(function (key, val) {
        data.$add(key, val)
      }),
      deleted: gurad(function (key) {
        data.$delete(key)
      })
    },
    scope: {
      set: guard(function (key, val) {
        scope[key] = val
      }),
      added: gurad(function (key, val) {
        scope.$add(key, val)
      }),
      deleted: gurad(function (key) {
        scope.$delete(key)
      })
    }
  }

  // sync scope and original data.
  this._observer
    .on('set:self', listeners.data.set)
    .on('added:self', listeners.data.added)
    .on('deleted:self', listeners.data.deleted)

  this._dataObserver
    .on('set:self', listeners.scope.set)
    .on('added:self', listeners.scope.added)
    .on('deleted:self', listeners.scope.deleted)

  /**
   * The guard prevents infinite loop
   * when syncing between two observers.
   *
   * @param fn
   * @returns {Function}
   */

  function guard (fn) {
    return function (key, val) {
      if (locked) return
      locked = true
      fn(key, val)
      locked = false
    }
  }
}

/**
 * Teardown the sync between scope and previous data object.
 *
 * @private
 */

exports._unsync = function () {
  var listeners = this._syncListeners

  this._observer
    .off('set:self', listeners.data.set)
    .off('added:self', listeners.data.added)
    .off('deleted:self', listeners.data.deleted)

  this._dataObserver
    .off('set:self', listeners.scope.set)
    .off('added:self', listeners.scope.added)
    .off('deleted:self', listeners.scope.deleted)
}



