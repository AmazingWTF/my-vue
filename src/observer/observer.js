var _ = require('../util')
var Emitter = require('../emitter')
var arrayAugmentations = require('./array-augmentations')
var objectAugmentations = require('./object-augmentations')

// Type enums 枚举类型

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
 * 次构造函数可以无参数调用，生成一个无值的 observer 以监听
 * 其他 observers
 * 
 * @constructor 
 * @extends {Emitter}
 * @private
 */

function Observer (value, type) {
  Emitter.call(this)
  this.value = value
  this.type = type
  this.initiated = false
  this.children = Object.create(null)
  if (value) {
    _.define(value, '$observer', this)
  }
}

var p = Observer.prototype = Object.create(Emitter.prototype)


/**
 * Observe an object of unknown type.
 * 监听一个未知类型的对象
 * 
 * @param {*} obj 
 * @return {Boolean} - return true if successfully observed.
 */

p.observer = function (obj) {
  if (obj && obj.$observer) {
    // already observered
    return
  }
  if (_.isArray(obj)) {
    this.observerArray(obj)
    return true
  }
  if (_.isObject(obj)) {
    this.observerObject(obj)
    return true
  }
}

p.connect = function (target, key) {

}

p.disconnect = function (target, key) {

}

_.mixin(p, require('./watch-array'))
_.mixin(p, require('./watch-object'))

module.exports = Observer