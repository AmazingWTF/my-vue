- 可以拦截取值 / 赋值操作，执行需要的操作

``` js
const obj = {}
let value = 'test'

// 常规对象属性赋值
obj.test = value

// 使用 defineProperty 设置属性值
Object.defineProperty(obj, 'test', {
  configurable: true,
  enumerable: true,
  get () {
    console.log('obj.test is found')
    return value
  },
  set (val) {
    console.log('obj.test is set')
    value = val
  }
})
```
