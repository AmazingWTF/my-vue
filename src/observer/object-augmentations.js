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
  this[key] = val
  this.$observer.convert(key, val)
  // emit 将事件对应的 callback 列表中的处理事件遍历执行，无 _cbs 则添加
  this.$observer.notify('added', key, val)
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
  this[key] = undefined
  delete this[key]
  this.$observer.notify('deleted', key)
})

module.exports = objectAugmentations
