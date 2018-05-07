// 事件管理

let uid = 0
class Event {
  constructor () {
    this.id = ++uid
    this._events = {}
  }

  $on (eventName, fn) {
    let _this = this
    ;(_this._events[eventName] || (_this._events[eventName] = [])).push(fn)
  }
  $off (eventName) {
    let _this = this
    let cbs = _this._events[eventName]
    cbs && (_this._events[eventName] = null)
  }
  // 注释部分为源码写法，但是个人觉得用不上(暂时)，所以注释掉，
  // 如果出了问题再来带着问题来找答案
  $once (eventName, fn) {
    let _this = this

    function on () {
      _this.$off(eventName)
      // fn.apply(_this, arguments)
      fn.apply(_this)
    }
    // on.fn = fn
    _this.$on(eventName, on)
    return _this
  }
  $emit (eventName, ...args) {
    let _this = this
    let cbs = _this._events[eventName]
    cbs && cbs.forEach(fn => {
      fn.apply(_this, args)
    })
    return _this
  }
}



// 
let event = new Event()

event.$once('test1', function (param) {
  console.log('test1触发')
})
event.$on('test2', function () {
  console.log('test2触发')
})

event.$off('test1')

event.$emit('test1')
event.$emit('test1')
event.$emit('test1')

event.$emit('test2')
event.$emit('test2')
event.$emit('test2')