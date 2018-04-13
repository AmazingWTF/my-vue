import { def, indexOf } from '../util/index'
import { observe } from '.';

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

;[
  'push',
  'pop',
  'unshift',
  'shift',
  'sort',
  'splice',
  'reverse'
]
.forEach(function (method) {
  let original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    // copy augments to an real Array
    let i = arguments.length,
      args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    let res = original.apply(this, args),
      ob = this.__ob__,
      inserted
    switch (method) {
      case 'push':
        inserted = args
        break;
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
    }
    // 如果新元素添加，先observe 
    // 因为上面已经执行了原生的方法，数组已经改变，所以直接observe
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return res
  })
})

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 * 
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */
def(
  arrayProto,
  '$set',
  function $set (index, val) {
    if (index >= this.length) {
      this.length = Number(index) + 1
    }
    return this.splice(index, 1, val)[0]
  }
)


/**
 * Convenience method to remove the element at given index
 * or target element reference
 * 
 * 删除给定下标的元素或者目标元素的引用(引用类型数据)
 * 
 * @param {*} item
 */

def(
  arrayProto,
  '$remove',
  function $remove (item) {
    if (!this.length) return
    let index = indexOf(this, item)
    if (index > -1) {
      return this.splice(index, 1)
    }
  }
)