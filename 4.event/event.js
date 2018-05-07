// 事件管理

let uid = 0
class Event {
  constructor () {
    this.id = ++uid
    this._events = {}
  }

  $on (eventName, cb) {
    let _this = this 
    (_this._events[eventName] || (_this._events[eventName] = [])).push(cb)
  }
}