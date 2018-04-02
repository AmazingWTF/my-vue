var _ = require('../util')
var Emitter = require('../emitter')
var arrayAugmentations = require('./array-augmentations')
var objectAugmentations = require('./object-augmentations')

// Type enums 枚举类型
var ARRAY = 0
var OBJECT = 1

/**
 * Observer class that are attached to each observered
 * object. They are essentially event emitters, but can
 * connect to each other like nodes to map the hierarchy
 * of data objects. Once connected, detected change events
 * can propagate up the nested object chain.
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

function Observer (value, type) {
  // 继承自 Emitter (on, once, emit 等方法)
  Emitter.call(this)
  // 挂载 相关数据方便 prototype 使用
  this.value = value
  this.type = type
  this.initiated = false
  this.adaptors = Object.create(null)
  // value 存在，则将 value 添加 $observer 属性
  if (value) {
    _.define(value, '$observer', this)
  }
}

var p = Observer.prototype = Object.create(Emitter.prototype)

/**
 * Initialize the observation based on value type.
 * Should only be called once.
 * 
 * 根据数据类型将数据初始化，同一个对象只能调用一次
 */

p.init = function () {
  var value = this.value
  if (this.type === ARRAY) {
    // augment method is used to rewrite value's __proto__
    _.augment(value, arrayAugmentations)
    this.link(value)
  } else if (this.type === OBJECT) {
    _.augment(value, objectAugmentations)
    this.walk(value)
  }
  this.initiated = true
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
    val = obj[key]
    this.observe(key, val)
    this.convert(key, val)
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
  var ob = Object.create(val)
  if (ob) {
    this.add(key, ob)
    if (ob.initiated) {
      this.deliver(key, val)
    } else {
      ob.init()
    }
  }

  this.emit('set', key, val)
  if (_.isArray(val)) {
    this.emit('set', key + '.length', val.length)
  }
}

/**
 * Unobserve a property.
 * 
 * @param {String} key
 * @param {*} val
 */

p.unobserve = function (key, val) {
  if (val && val.$observer) {
    this.remove(key, val.$observer)
  }
}

/**
 * Convert a tip value into getter/setter so we can emit 
 * the events when the property is accessed/changed.
 * Properties prefixed with '$' or '_' are ignored.
 * 
 * 将指定的值转化为 getter/setter， 以便在此属性变化的时候 emit
 * 对应的事件，前缀是 '$' 或 '_' 的会被忽略
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
      ob.emit('get', key)
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      ob.unobserve(key, val)
      ob.observe(key, newVal)
      val = newVal
    }
  })
}

/**
 * Link a list of items to the observer's value Array.
 * When any of these items emit change event, the Array will be notified.
 * 
 * 连接 items 列表到 observer 数组，当 items emit 改变事件时，数组会收到通知
 * @param {Array} items 
 */

p.link = function (items) {

}

/**
 * Unlink the items from the observer's value Array.
 * 
 * 断开 items 和 observer 数组的连接
 * @param {Array} items 
 */

p.unlink = function (items) {

}


/**
 * Walk through an observed object and emit its tip values.
 * This is necessary because newly observed objects emit their values
 * during init; for already observed ones we can skip the initialization,
 * but still emit the values.
 * 
 * 遍历一个 observed 对象，并且 emit 对应的值。
 * 这个方法是必须的，因为新近 observed 的对象会在 init 中 emit 它们的值，
 * 对已经 observed 的就跳过 initialize 过程，只 emit 它的 value
 * 
 * @param {String} key
 * @param {*} val
 */

p.deliver = function (key, val) {

}

/**
 * Addd a child observer for a property key,
 * capture its get/set/mustate events and relay the evnets
 * while prepending a key segment to the path.
 * 
 * 给对应的 key 添加一个 observer, 在改变 key 之前捕捉它的 get/set/mustate 
 * 事件并且传递这个事件
 * 
 * @param {String} key
 * @param {Observer} ob
 */

p.add = function (key, ob) {
  var self = this
  var base = key + '.'
  var adaptors = this.adaptors[key] = {}

  adaptors.get = function (path) {
    path = base + path
    self.emit('get', path)
  }

  adaptors.set = function (path, val) {
    path = base + path
    self.emit('set', path, val)
  }

  adapotrs.mutate = function (path, val, mutation) {
    path === path
      ? base + path
      : key
    self.emit('mutate', path, val, mutation)
    self.emit('set', path + '.length', val.length)
  }

  ob.on('get', adaptors.get)
    .on('set', adaptors.set)
    .on('mutate', adaptors.mutate)
}

/**
 * Remove a child observer
 * 
 * @param {String} key
 * @param {Observer} ob
 */

p.remove = function (key, ob) {
  var adaptors = this.adaptors[key]
  this.adaptors[key] = null
  ob.off('get', adaptors.get)
    .off('set', adaptors.set)
    .off('mutate', adaptors.mutate)
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * 
 * 意图为指定的值创建一个 observer，创建成功则返回一个 observer 实例，
 * 如果这个值已经有 observer，则直接返回其 observer
 * 
 * @param {*} value 
 * @return {Observer}
 * @static
 */

Observer.create = function (value) {
  if (value && value.$observer) {
    return value.$observer
  } if (_.isArray(value)) {
    return new Observer(value, ARRAY)
  } else if (_.isObject(value)) {
    return new Observer(value, OBJECT)
  }
}

module.exports = Observer