
let callback = {
  target: null
}

function defineReactive (object, key, value) {
  const array = []
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get () {
      if (callback.target) {
        array.push(callback.target)
      }
      return value
    },
    set (newVal) {
      if (newVal !== value) {
        array.forEach(fun => fun(newVal, value))
      }
      value = newVal
    }
  })
}
