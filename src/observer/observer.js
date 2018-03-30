var _ = require('../util')
var Emitter = require('../emitter')

/**
 * Observer class that are attached to each observered
 * object. They are essentially event emitters, but can
 * connect to each other and relay the events up the nested
 * object chain.
 * 
 * Observer 被添加在每一个被监听的对象上，它们本质上是事件发射器，
 * 但是可以连接彼此，并且能够从嵌套对象内部将事件冒泡向上传播 (个人理解)
 * 
 * @constructor 
 * @extends {Emitter}
 * @private
 */

function Observer () {
  Emitter.call(this)
  this.connections = Object.create(null)
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