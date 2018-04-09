var _ = require('../util')
var Emitter = require('../emitter')
var arrayAugmentations = require('./array-augmentations')
var objectAugmentations = require('./object-augmentations')

/**
 * Type enums 枚举类型
 */
var ARRAY = 0
var OBJECT = 1

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

function Observer (value, type, options) {
  // 继承自 Emitter (on, once, emit 等方法)
  Emitter.call(this, options && options.callbackContext)
  // 挂载 相关数据方便 prototype 使用
  this.value = value
  this.type = type
  this.parents = null
  // 根据 value 类型(Object|Array)，则将 value 添加对应的 $observer 属性
  if (value) {
    _.define(value, '$observer', this)
    if (type === ARRAY) {
      _.augment(value, arrayAugmentations)
      this.link(value)
    } else if (type === OBJECT) {
      if (options && options.doNotAlterProto) {
        _.deepMixin(value, objectAugmentations)
      } else {
        _.augment(value, objectAugmentations)
      }
      this.walk(value)
    }
  }
}

var p = Observer.prototype = Object.create(Emitter.prototype)

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

Observer.pathDelimiter = '\b'

/**
 * Switch to globally control whether to emit get evnets.
 * Only enabled during dependency collections.
 */
Observer.emitGet = false

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
  if (value &&
    value.hasOwnProperty('$observer') &&
    value.$observer instanceof Observer) {
    return value.$observer
  }
  if (_.isArray(value)) {
    return new Observer(value, ARRAY, options)
  } else if (_.isObject(value) && !value._scope) { // avoid Vue instance
    return new Observer(value, OBJECT, options)
  }
}

/**
 * Walk through each property, converting them and adding them as child.
 * This method should only be called when value type is object.
 *
 * 遍历每个属性，转化并且将其添加到这个 observer
 */

p.walk = function (obj) {
  var key, val
  for (key in obj) {
    if (val.hasOwnProperty(key)) {
      val = obj[key]
      this.observe(key, val)
      this.convert(key, val)
    }
  }
}

/**
 * Link a list of items to the observer's value Array.
 * When any of these items emit change event, the Array will be notified.
 *
 * 连接 items 列表到 observer 数组，当 items emit 改变事件时，数组会收到通知
 * @param {Array} items
 */

p.link = function (items, index) {
  index = index || 0
  for (var i = 0, l = items.length; i < l; i++) {
    this.observe(i + index, items[i])
  }
}

/**
 * Unlink the items from the observer's value Array.
 *
 * 断开 items 和 observer 数组的连接
 * @param {Array} items
 */

p.unlink = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    this.unobserve(items[i])
  }
}

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

p.observe = function (key, val) {
  var ob = Observer.create(val)
  if (ob) {
    if (ob.findParent(this) > -1) return
    (ob.parents || (ob.parents = [])).push({
      ob: this,
      key: key
    })
  }
}

/**
 * Unobserve a property, removing self from
 * its observer's parent list.
 *
 * 取消监视属性，将自己从 observer parent 列表中移除
 *
 * @param {*} val
 */

p.unobserve = function (val) {
  if (val && val.$observer) {
    val.$observer.findParent(this, true)
  }
}

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

p.convert = function (key, val) {
  var prefix = key.charAt(0)
  if (prefix === '$' || prefix === '_') {
    return
  }
  var ob = this
  Object.defineProperty(this.value, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      if (Observer.emitGet) {
        ob.propagate('get', key)
      }
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      ob.unobserve(val)
      ob.observe(key, newVal)
      ob.emit('set:self', key, newVal)
      ob.propagate('set', key, newVal)
      if (_.isArray(newVal)) {
        ob.propagate('set',
                    key + Observer.pathDelimiter + 'length',
                    newVal.length)
      }
      val = newVal
    }
  })
}

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

p.propagate = function (event, path, val, mutation) {
  this.emit(event, path, val, mutation)
  if (!this.parents) return
  for (var i = 0, l = this.parents.length; i < l; i++) {
    var parent = this.parents[i]
    var ob = parent.ob
    var key = parent.key
    var parentPath = path
      ? key + Observer.pathDelimiter + path
      : key
    ob.propagate(event, parentPath, val, mutation)
  }
}

/**
 * Update child elements' parent key,
 * should only be called when value type is Array.
 */

p.updateIndices = function () {
  var arr = this.value
  var i = arr.length
  var ob
  while (i--) {
    ob = arr[i] && arr[i].$observer
    if (ob) {
      var j = ob.findParent(this)
      ob.parents[j].key = i
    }
  }
}

/**
 * Find a parent option object
 *
 * @param {Observer} parent
 * @param {Boolean} remove - whether to remove the parent
 * @returns {Number} - index of parent
 */
p.findParent = function (parent, remove) {
  var parents = this.parents
  if (!parents) return -1
  var i = parents.length
  while (i--) {
    var p = parents[i]
    if (p.ob === parent) {
      if (remove) parents.splice(i, 1)
      return i
    }
  }
  return -1
}

module.exports = Observer