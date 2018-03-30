'use strict'

// 实现监听对象的变化

function Observer (data) {
  this.data = data
  this.walk(data)
}

Observer.prototype = {
  // 遍历对象的方法
  walk (obj) {
    let val
    for (let key in obj) {
      // This is obj's own property
      if (obj.hasOwnProperty(key)) {
        val = obj[key]
  
        if (typeof val === 'object') {
          new Observer(val)
        }
  
        this.convert(key, val)
      }
    }
  },
  // 给每个键值设置 getter 和 setter
  convert (key, val) {
    Object.defineProperty(this.data, key, {
      enumerable: true,
      configurable: true,
      get () {
        console.log('你访问了: ', key)
        return val
      },
      set (newVal) {
        console.log('你设置了: ', key)
        console.log('新的' + key + ' = ' + newVal)
        if (newVal === val) return
        val = newVal
      }
    })
  }
}


// class 写法
class Observer {
  constructor (data) {
    this.data = data
    this.walk(data)
  }

  walk (data) {
    let val
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        val = data[key]

        if (typeof val === 'object') {
          new Observer(val)
        }
        
        this.convert(key, val)
      }
    }
  }

  convert (key, val) {
    Object.defineProperty(this.data, key, {
      enumerable: true,
      configurable: true,
      get () {
        console.log(`你访问了: ${ key }`)
        return val
      },
      set (newVal) {
        console.log(`你设置了: ${ key }`)
        console.log(`新的${ key } 为: ${ newVal }`)
        val = newVal
      }
    })
  }
}
