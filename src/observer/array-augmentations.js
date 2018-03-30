var _ = require('../util')
var slice = Array.prototype.slice
var arrayAugmentations = Object.create(Array.prototype)

/**
 * Intercept mutating methods and emit events
 */

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  var original = Array.prototype[method]
  // defined wrapped method
  // 在原生方法加上包裹层
  _.define(arrayArgumentations, method, function () {
    var args = slice.call(arguments)
    var value = original.apply(this, args)
    var ob = this.$observer
    var inserted, removed

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'pop':
      case 'shift':
        removed = [result]
        break
      case 'splice':
        inserted = args.slice(2)
        removed = result
        break
    }

    ob.link(inserted)
    ob.unlink(removed)

    ob.emit('mutate', '', this, {
      method: method,
      args: args,
      result: result,
      inserted: inserted,
      removed: removed
    })
  })
})

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

_.define(arrayAugmentations, '$set', function (index, val) {
  if (index >= this.length) {
    this.length = index + 1
  }
  return this.splice(index, 1, val)[0]
})

/**
 * Convenience method to remove the element at given index
 * 
 * 移除指定下标的便利方法
 * 
 * @param {Number} index
 * @return {*}
 */
_.define(arrayAugmentations, '$remove', function (index) {
  if (index > -1) {
    return this.splice(index, 1)[0]
  }
})