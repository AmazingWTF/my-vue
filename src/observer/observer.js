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
 * 次构造函数可以无参数调用，生成一个无值的 observer 以监听
 * 其他 observers
 * 
 * @constructor 
 * @extends Emitter
 * @param {Array|Object} [value]
 * @param {Number} [type]
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



p.init = function () {
  var value = this.value
  if (this.type === ARRAY) {
    _.augment()
  }
}

module.exports = Observer