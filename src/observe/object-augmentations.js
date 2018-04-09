var _ = require('../util')
var objectAugmentations = Object.create(Object.prototype)

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

_.define(objectAugmentations, '$add', function (key, val) {
  if (this.hasOwnProperty(key)) return
  _.define(this, key, val, true)
  var ob = this.$observer
  ob.observe(key, val)
  ob.convert(key, val)
  ob.emit('added:self', key, val)
  ob.propagate('added', key, val)
})

/**
 * Delete a property from an observed object
 * and emits corresponding event.
 * 
 * 删除一个 observed 对象的属性，并且 emit 对应的事件
 * 
 * @param {String} key
 * @public
 */

_.define(objectAugmentations, '$delete', function (key) {
  if (!this.hasOwnProperty(key)) return
  // trigger set events (the 'set' event seems to be a native property (setter/getter) of the object)
  delete this[key]
  var ob = this.$observer
  ob.emit('deleted:self', key)
  ob.propagate('deleted', key)
})

module.exports = objectAugmentations
