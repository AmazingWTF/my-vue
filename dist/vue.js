'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var util = createCommonjsModule(function (module, exports) {
  /**
   * Mix properties into target object
   * 
   * @param {target} object 
   * @param {mixin} object 
   */

  exports.mixin = function (target, mixin) {
    for (var key in mixin) {
      if (target[key] !== mixin[key]) {
        target[key] = mixin[key];
      }
    }
  };

  /**
   * Mixin including non-enumerables, and copy property descriptors.
   *
   * @param to
   * @param from
   */

  exports.deepMixin = function (to, from) {
    Object.getOwnPropertyNames(from).forEach(function (key) {
      var descriptor = Object.getOwnPropertyDescriptor(from, key);
      Object.defineProperty(to, key, descriptor);
    });
  };

  /**
   * Proxy a property on one object to another
   *
   * 用一个对象的属性代理另一个对象的属性
   *
   * @param to
   * @param from
   * @param key
   */
  exports.proxy = function (to, from, key) {
    if (to.hasOwnProperty(key)) return;
    Object.defineProperty(to, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        return from[key];
      },
      set: function (val) {
        from[key] = val;
      }
    });
  };

  /**
   * Object type check. Only returns true 
   * for plain Javascript objects.
   * 
   * @param {*} obj
   * @return {Boolean}
   */

  exports.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  /**
   * Array type check
   * 
   * @param {*} obj 
   * @return {Boolean}
   */

  exports.isArray = function (obj) {
    return Array.prototype.isArray.call(obj);
  };

  /**
   * Define a property for obj.
   * 
   * @param {Object} obj
   * @param {String} key
   * @param {*} val
   * @param {Boolean} [enumerable]
   */

  exports.define = function (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  };

  /**
   * Augment an Object or Array by either
   * intercepting the prototype chain using __proto__,
   * or copy over property descriptors
   *
   * 重写对象的 __proto__ 属性或使用对象原生的直接方法定义在对象身上，
   * 来扩展一个对象或数组，拦截本来的原型链
   * 
   * @param {Object|Array} target
   * @param {Object} proto
   */

  if ('__proto__' in {}) {
    exports.augment = function (target, proto) {
      target.__proto__ = proto;
    };
  } else {
    exports.augment = exports.deepMixin;
  }
});
var util_1 = util.mixin;
var util_2 = util.deepMixin;
var util_3 = util.proxy;
var util_4 = util.isObject;
var util_5 = util.isArray;
var util_6 = util.define;
var util_7 = util.augment;

/**
 * Prototype properties on every Vue instance.
 */

var properties = function (p) {

  /**
   * The $root recursively points to the root instance.
   *
   * @readonly
   */

  Object.defineProperty(p, '$root', {
    get: function () {
      return this.$parent ? this.$parent.$root : this;
    }
  });

  /**
   * $data has a setter which does a bunch of teardown/setup work.
   *
   * $data 拥有一个用来执行大量卸载/挂载的工作
   */

  Object.defineProperty(p, '$data', {
    get: function () {
      return this._data;
    },
    set: function (newData) {
      this._initData(newData);
    }
  });
};

/**
 * Simple event emitter based on component/emitter.
 *
 * @constructor
 * @param {Object} ctx - the context to call listeners with.(监听器的上下文)
 */

function Emitter(ctx) {
  this._ctx = ctx || this;
}

var p = Emitter.prototype;

/**
 * Listen on the given 'event' with 'fn'
 * 为事件 event 注册监听事件，fn 为触发后执行的函数
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */
p.on = function (event, fn) {
  this._cbs = this._cbs || {};(this._cbs[event] = this._cbs[event] || []).push(fn);
  return this;
};

/**
 * Adds an 'event' listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 */

p.once = function (event, fn) {
  var _this = this;
  this._cbs = this._cbs || {};

  // 使用 on 函数作为回调，on 函数内部移除这个监听事件，以此达到 once 监听
  function on() {
    _this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

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
  this._cbs = this._cbs || {};

  // all 
  if (!arguments.length) {
    this._cbs = {};
    return this;
  }

  // specific event
  var callbacks = this._cbs[event];
  if (!callbacks) return this;

  // remove all handlers
  if (arguments.length === 1) {
    delete this._cbs[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

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
  this._cbs = this._cbs || {};
  var callbacks = this._cbs[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (let i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i].call(this._ctx, a, b, c);
    }
  }

  return this;
};

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
  this._cbs = this._cbs || {};
  var callbacks = this._cbs[event],
      args;

  if (callbacks) {
    callbacks = callbacks.slice(0);
    args = callbacks.slice.call(arguments, 1);
    for (var i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i].apply(this._ctx, args);
    }
  }

  return this;
};

var emitter = Emitter;

var slice = Array.prototype.slice;
var arrayAugmentations = Object.create(Array.prototype)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  var original = Array.prototype[method];
  // defined wrapped method
  // 在原生方法加上包裹层
  util.define(arrayAugmentations, method, function () {

    var args = slice.call(arguments);
    var result = original.apply(this, args);
    var ob = this.$observer;
    var inserted, removed, index;

    switch (method) {
      case 'push':
        inserted = args;
        index = this.length - args.length;
        break;
      case 'unshift':
        inserted = args;
        index = 0;
        break;
      case 'pop':
        removed = [result];
        index = this.length;
        break;
      case 'shift':
        removed = [result];
        index = 0;
        break;
      case 'splice':
        inserted = args.slice(2);
        removed = result;
        index = args[0];
        break;
    }

    // link/unlink added/removed elements
    if (inserted) ob.link(inserted, index);
    if (removed) ob.unlink(removed);

    // update indices
    if (method !== 'push' && method !== 'pop') {
      ob.updateIndices();
    }

    // emit length change
    if (inserted || removed) {
      ob.propagate('set', 'length', this.length);
    }

    // empty path, value is the Array itself
    ob.propagate('mutate', '', this, {
      method: method,
      args: args,
      index: index,
      result: result,
      removed: removed || [],
      inserted: inserted || []
    });

    return result;
  });
});

/**
 * Swap element at the given index with a new value
 * and emits corresponding event
 * 
 * 用新的值替换指定下标的元素，并且 emit 对应的事件
 * 
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element 替换掉的元素
 */

util.define(arrayAugmentations, '$set', function (index, val) {
  if (index >= this.length) {
    this.length = index + 1;
  }
  // 这里的 splice 是重写的方法，同下
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index
 * 
 * 移除指定下标的便利方法
 * 
 * @param {Number} index
 * @return {*}
 */

util.define(arrayAugmentations, '$remove', function (index) {
  if (typeof index !== 'number') {
    index = this.indexOf(index);
  }
  if (index > -1) {
    return this.splice(index, 1)[0];
  }
});

var arrayAugmentations_1 = arrayAugmentations;

var objectAugmentations = Object.create(Object.prototype);

/**
 * Add a new property to an observed object
 * and emits corresponding event
 * 
 * 给一个被监听的对象添加一个新的属性，并且 emit 对应的触发事件
 * 
 * @param {String} key
 * @param {*} val
 * @public
 */

util.define(objectAugmentations, '$add', function (key, val) {
  if (this.hasOwnProperty(key)) return;
  util.define(this, key, val, true);
  var ob = this.$observer;
  ob.observe(key, val);
  ob.convert(key, val);
  ob.emit('added:self', key, val);
  ob.propagate('added', key, val);
});

/**
 * Delete a property from an observed object
 * and emits corresponding event.
 * 
 * 删除一个 observed 对象的属性，并且 emit 对应的事件
 * 
 * @param {String} key
 * @public
 */

util.define(objectAugmentations, '$delete', function (key) {
  if (!this.hasOwnProperty(key)) return;
  // trigger set events (the 'set' event seems to be a native property (setter/getter) of the object)
  delete this[key];
  var ob = this.$observer;
  ob.emit('deleted:self', key);
  ob.propagate('deleted', key);
});

var objectAugmentations_1 = objectAugmentations;

/**
 * Type enums 枚举类型
 */
var ARRAY = 0;
var OBJECT = 1;

/**
 * Observer class that are attached to each observed
 * object. Observers can connect to each other like nodes
 * to map the hierarchy of data objects. Once connected,
 * detected change events can propagate up the nested chain.
 *
 * Observer 被添加在每一个被监听的对象上，它们本质上是事件发射器，
 * 但是可以将彼此连接，像 DOM 遍历一样遍历数据对象。连接之后，发现
 * change 事件可以从对象嵌套结构中冒泡上来
 *
 * The constructor can be invoked without arguments to
 * create a value-less observer that simply listens to
 * other observers
 *
 * 此构造函数可以无参数调用，生成一个无值的 observer 以监听
 * 其他 observers
 *
 * @constructor
 * @extends Emitter
 * @param {Array|Object} [value]
 * @param {Number} [type]
 */

function Observer(value, type, options) {
  // 继承自 Emitter (on, once, emit 等方法)
  emitter.call(this, options && options.callbackContext);
  // 挂载 相关数据方便 prototype 使用
  this.value = value;
  this.type = type;
  this.parents = null;
  // 根据 value 类型(Object|Array)，则将 value 添加对应的 $observer 属性
  if (value) {
    util.define(value, '$observer', this);
    if (type === ARRAY) {
      util.augment(value, arrayAugmentations_1);
      this.link(value);
    } else if (type === OBJECT) {
      if (options && options.doNotAlterProto) {
        util.deepMixin(value, objectAugmentations_1);
      } else {
        util.augment(value, objectAugmentations_1);
      }
      this.walk(value);
    }
  }
}

var p$1 = Observer.prototype = Object.create(emitter.prototype);

/**
 * Simply concatenating the path segments with '.' cannot
 * deal with keys that happen to contain the dot.
 *
 * Instead of the dot, we use the backspace character
 * which is much less likely to appear as property keys.
 *
 * 简单的使用 '.' 连接路径片段无法处理键中含有 '.' 的情况
 * 使用空格代替点，因为空格更不可能作为属性键出现
 */

Observer.pathDelimiter = '\b';

/**
 * Switch to globally control whether to emit get evnets.
 * Only enabled during dependency collections.
 */
Observer.emitGet = false;

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * 意图为指定的值创建一个 observer，创建成功则返回一个 observer 实例，
 * 如果这个值已经有 observer，则直接返回其 observer
 *
 * @param {*} value
 * @return {Observer|undefined}
 * @static
 */

Observer.create = function (value, options) {
  if (value && value.hasOwnProperty('$observer') && value.$observer instanceof Observer) {
    return value.$observer;
  }
  if (util.isArray(value)) {
    return new Observer(value, ARRAY, options);
  } else if (util.isObject(value) && !value._scope) {
    // avoid Vue instance
    return new Observer(value, OBJECT, options);
  }
};

/**
 * Walk through each property, converting them and adding them as child.
 * This method should only be called when value type is object.
 *
 * 遍历每个属性，转化并且将其添加到这个 observer
 */

p$1.walk = function (obj) {
  var key, val;
  for (key in obj) {
    if (val.hasOwnProperty(key)) {
      val = obj[key];
      this.observe(key, val);
      this.convert(key, val);
    }
  }
};

/**
 * Link a list of items to the observer's value Array.
 * When any of these items emit change event, the Array will be notified.
 *
 * 连接 items 列表到 observer 数组，当 items emit 改变事件时，数组会收到通知
 * @param {Array} items
 */

p$1.link = function (items, index) {
  index = index || 0;
  for (var i = 0, l = items.length; i < l; i++) {
    this.observe(i + index, items[i]);
  }
};

/**
 * Unlink the items from the observer's value Array.
 *
 * 断开 items 和 observer 数组的连接
 * @param {Array} items
 */

p$1.unlink = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    this.unobserve(items[i]);
  }
};

/**
 * If a property is observable,
 * create an Observer for it and add it as a child.
 * This method is called only on properties observed
 * for the first time.
 *
 * 如果此属性可以被监听，创建一个 observer 并且添加进去，
 * 此方法只能在属性首次被监听的时候调用
 *
 * @param {String} key
 * @param {*} val
 */

p$1.observe = function (key, val) {
  var ob = Observer.create(val);
  if (ob) {
    if (ob.findParent(this) > -1) return;
    (ob.parents || (ob.parents = [])).push({
      ob: this,
      key: key
    });
  }
};

/**
 * Unobserve a property, removing self from
 * its observer's parent list.
 *
 * 取消监视属性，将自己从 observer parent 列表中移除
 *
 * @param {*} val
 */

p$1.unobserve = function (val) {
  if (val && val.$observer) {
    val.$observer.findParent(this, true);
  }
};

/**
 * Convert a tip value into getter/setter so we can emit
 * the events when the property is accessed/changed.
 * Properties prefixed with '$' or '_' are ignored.
 *
 * 将指定的值转化为 getter/setter， 以便在此属性变化的时候 emit
 * 对应的事件，前缀是 '$' 或 '_' 的会被忽略(私有属性)
 *
 * @param {String} key
 * @param {*} val
 */

p$1.convert = function (key, val) {
  var prefix = key.charAt(0);
  if (prefix === '$' || prefix === '_') {
    return;
  }
  var ob = this;
  Object.defineProperty(this.value, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      if (Observer.emitGet) {
        ob.propagate('get', key);
      }
      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;
      ob.unobserve(val);
      ob.observe(key, newVal);
      ob.emit('set:self', key, newVal);
      ob.propagate('set', key, newVal);
      if (util.isArray(newVal)) {
        ob.propagate('set', key + Observer.pathDelimiter + 'length', newVal.length);
      }
      val = newVal;
    }
  });
};

/**
 * Emit event on self and recursively propagate all parents.
 *
 * 自身 emit 事件，并且递归 propagate 所有的 parents
 *
 * @param {String} event
 * @param {String} path
 * @param {*} val
 * @param {Object|undefined} mutation
 */

p$1.propagate = function (event, path, val, mutation) {
  this.emit(event, path, val, mutation);
  if (!this.parents) return;
  for (var i = 0, l = this.parents.length; i < l; i++) {
    var parent = this.parents[i];
    var ob = parent.ob;
    var key = parent.key;
    var parentPath = path ? key + Observer.pathDelimiter + path : key;
    ob.propagate(event, parentPath, val, mutation);
  }
};

/**
 * Update child elements' parent key,
 * should only be called when value type is Array.
 */

p$1.updateIndices = function () {
  var arr = this.value;
  var i = arr.length;
  var ob;
  while (i--) {
    ob = arr[i] && arr[i].$observer;
    if (ob) {
      var j = ob.findParent(this);
      ob.parents[j].key = i;
    }
  }
};

/**
 * Find a parent option object
 *
 * @param {Observer} parent
 * @param {Boolean} remove - whether to remove the parent
 * @returns {Number} - index of parent
 */
p$1.findParent = function (parent, remove) {
  var parents = this.parents;
  if (!parents) return -1;
  var i = parents.length;
  while (i--) {
    var p = parents[i];
    if (p.ob === parent) {
      if (remove) parents.splice(i, 1);
      return i;
    }
  }
  return -1;
};

var observer = Observer;

var scopeEvents = ['set', 'mutate', 'added', 'deleted', 'added:self', 'deleted:self'];

/**
 * Kick off the initialization process on the instance creation.
 *
 * @param {Object} options
 * @private
 */

var _init = function (options) {
  this.$options = options = options || {};
  // create scope
  this._initScope(options);
  // setup initial data
  this._initData(options.data || {}, true);
  // setup property proxy
  this._initProxy();
};

/**
 * Setup scope and listen to parent scope changes.
 * Only called once during _init().
 *
 * @param {Object} options
 * @private
 */

var _initScope = function (options) {
  var parent = this.$parent = options.parent;
  var scope = this._scope = parent && options._inheritScope !== false ? Object.create(parent._scope) : {};
  // create scope observer
  this._observer = observer.create(scope, {
    callbackContext: this,
    doNotAlterProto: true
  });

  if (!parent) return;

  // relay change events that sent down from
  // the scope prototype chain.
  // 传递从原型链中发送下来的事件
  var ob = this._observer;
  var pob = parent._observer;
  var listeners = this._scopeListeners = {};
  scopeEvents.forEach(function (event) {
    var cb = listeners[event] = function (key, a, b) {
      // since these events come from upstream,
      // we only emit them if we don't have the same keys
      // shadowing them in current scope.
      // 因为这些事件来自上级，所以如果当前 scope 如果没有对应的键，
      // 就只能 emit 它们
      if (!scope.hasOwnProperty(key)) {
        ob.emit(event, key, a, b);
      }
    };
    pob.on(event, cb);
  });
};

var _initData = function (data, init) {
  var scope = this._scope;

  if (!init) {
    // teardown old sync listeners.
    this._unsync();
    // delete keys not present in the new data.
    for (var key in scope) {
      if (scope.hasOwnProperty(key) && !(key in data)) {
        scope.$delete(key);
      }
    }
  }

  // copy instantiation data into scope
  for (var key in data) {
    if (scope.hasOwnProperty(key)) {
      // existing property, trigger set
      scope[key] = data[key];
    } else {
      // new property
      scope.$add(key, data[key]);
    }
  }

  // sync scope and new data.
  this._data = data;
  this._dataObserver = observer.create(data);
  this._sync();
};

/**
 * Proxy the scope properties on the instance itself.
 * So that vm.a = vm._scope.a
 * @private
 */

var _initProxy = function () {
  // proxy every scope property on the instance itself
  var scope = this._scope;
  for (var key in scope) {
    util.proxy(this, scope, key);
  }
  // keep proxy up-to-date with the added/deleted keys.
  this._observer.on('added:self', function (key) {
    util.proxy(this, scope, key);
  }).on('deleted:self', function (key) {
    delete this[key];
  });
};

/**
 * Setup two-way sync between the instance scope and
 * the original data. Requires teardown.
 *
 * @private
 */

var _sync = function () {
  var data = this.data;
  var scope = this._scope;
  var locked = false;

  var listeners = this._syncListeners = {
    data: {
      set: guard(function (key, val) {
        data[key] = val;
      }),
      added: gurad(function (key, val) {
        data.$add(key, val);
      }),
      deleted: gurad(function (key) {
        data.$delete(key);
      })
    },
    scope: {
      set: guard(function (key, val) {
        scope[key] = val;
      }),
      added: gurad(function (key, val) {
        scope.$add(key, val);
      }),
      deleted: gurad(function (key) {
        scope.$delete(key);
      })
    }

    // sync scope and original data.
  };this._observer.on('set:self', listeners.data.set).on('added:self', listeners.data.added).on('deleted:self', listeners.data.deleted);

  this._dataObserver.on('set:self', listeners.scope.set).on('added:self', listeners.scope.added).on('deleted:self', listeners.scope.deleted);

  /**
   * The guard prevents infinite loop
   * when syncing between two observers.
   *
   * @param fn
   * @returns {Function}
   */

  function guard(fn) {
    return function (key, val) {
      if (locked) return;
      locked = true;
      fn(key, val);
      locked = false;
    };
  }
};

/**
 * Teardown the sync between scope and previous data object.
 *
 * @private
 */

var _unsync = function () {
  var listeners = this._syncListeners;

  this._observer.off('set:self', listeners.data.set).off('added:self', listeners.data.added).off('deleted:self', listeners.data.deleted);

  this._dataObserver.off('set:self', listeners.scope.set).off('added:self', listeners.scope.added).off('deleted:self', listeners.scope.deleted);
};

/**
 * init
 *   - _initScope
 *     判断
 *
 *
 */

var init = {
  _init: _init,
  _initScope: _initScope,
  _initData: _initData,
  _initProxy: _initProxy,
  _sync: _sync,
  _unsync: _unsync
};

/**
 * Start compilation of instance.
 * 开始编译实例
 * 
 * @private
 */
var _compile = function () {};

var compile = {
  _compile: _compile
};

var $get = function () {};

var $set = function () {};

var $add = function () {};

var $delete = function () {};

var $watch = function () {};

var $unwatch = function () {};

var $toJSON = function () {};

var $log = function () {};

var data = {
	$get: $get,
	$set: $set,
	$add: $add,
	$delete: $delete,
	$watch: $watch,
	$unwatch: $unwatch,
	$toJSON: $toJSON,
	$log: $log
};

var $appendTo = function () {};

var $prependTo = function () {};

var $before = function () {};

var $after = function () {};

var $remove = function () {};

var dom = {
	$appendTo: $appendTo,
	$prependTo: $prependTo,
	$before: $before,
	$after: $after,
	$remove: $remove
};

var events = createCommonjsModule(function (module, exports) {
['emit', 'off', 'on', 'once'].forEach(function (method) {
    exports[method] = function () {};
  });

  exports.$boardcast = function () {};

  exports.$dispatch = function () {};
});
var events_1 = events.$boardcast;
var events_2 = events.$dispatch;

var $mount = function () {};

var $destroy = function () {};

var lifecycle = {
	$mount: $mount,
	$destroy: $destroy
};

var config = {

  assetTypes: ['directive', 'filter', 'partial', 'effect', 'component']

};

var global$1 = createCommonjsModule(function (module, exports) {
  /**
   * Configuration
   */

  exports.config = function () {};

  /**
   * Class inheritance
   */

  exports.extend = function () {};

  /**
   * Plugin system
   */

  exports.use = function () {};

  /**
   * Expose some internal utilities
   */

  exports.require = function () {};

  config.assetTypes.forEach(function (type) {
    var registry = '_' + type + 's';
    exports[registry] = {};

    exports[type] = function (id, definition) {
      this[registry][id] = definition;
    };
  });

  exports.nextTick = util.nextTick;
});
var global_1 = global$1.config;
var global_2 = global$1.extend;
var global_3 = global$1.use;
var global_4 = global$1.require;
var global_5 = global$1.nextTick;

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

function Vue(options) {
  this._init(options);
}

var p$2 = Vue.prototype;

/**
 * Define prototype properties.
 */

properties(p$2);

/**
 * Mixin internal instance methods.
 */

util.mixin(p$2, init);
util.mixin(p$2, compile);

/**
 * Mixin API instance methods.
 */

util.mixin(p$2, data);
util.mixin(p$2, dom);
util.mixin(p$2, events);
util.mixin(p$2, lifecycle);

/**
 * Mixin global API.
 */

util.mixin(Vue, global$1);

var vue = Vue;

module.exports = vue;
