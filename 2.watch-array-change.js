'use strict'

// 实现监听数组变化

// ES6写法
class FakeArray extends Array {
  constructor() {
    super()
    let len = arguments.length, i = 0
    for (; i < len; i++) {
      this[i] = arguments[i]
    }
    this.length = len
  }

  push() {
    console.log('this is FakeArray\'s own push method')

    return Array.prototype.push.apply(this, arguments)
  }
}

// ES5写法 (组合寄生式继承)
function FakeArray () {
  // 创建一个继承自 Array 的新对象
  var a = Array.apply(null, arguments)
  // 关联实例对象的 __proto__ 和 constructor
  a.__proto__ = FakeArray.prototype
  a.constructor = FakeArray

  return a
}

let original = Array.prototype
// 将 FakeArray 的 prototype 指向 Array 的 prototype
FakeArray.prototype = original
// 将 FakeArray 的 prototype 的 constructor 指向 FakeArray
FakeArray.prototype.constructor = FakeArray
// 重写 FakeArray 的 原型对象中的方法
FakeArray.prototype.push = function () {
  console.log(`this is FakeArray's own push method`)

  return original.push.apply(this, arguments)
}
