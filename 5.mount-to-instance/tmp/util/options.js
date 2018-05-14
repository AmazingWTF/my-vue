function isFn (value) {
  return typeof value === 'function'
}

export const mergeOptions = function (parent, child) {
  // data methods computed watch
  let options = {}
  // 合并data 同名覆盖
  options.data = mergeData(parent.data, child.data)
  // 合并methods 同名覆盖
  options.methods = merge(parent.methods, child.methods)
  //合并computed 同名覆盖
  options.computed = merge(parent.computed, child.computed)
  // 合并watch 同名合并成为数组
  options.watch = mergeWatch(parent.watch, child.watch)

  return options
}

function merge (parent, child) {
  if (!parent) return child
  if (!child) return parent
  return Object.assign(parent, child)
}

// return一个函数(因为data必须是个函数)
function mergeData (parent, child) {
  if (!parent) return child
  if (!child) return parent
  return function mergeFnc () {
    return Object.assign(isFn(parent) ? parent.call(this) : parent, isFn(child) ? child.call(this) : child)
  }
}

function mergeWatch (parent, child) {
  if (!child) return Object.create(parent || {})
  let res = Object.assign({}, parent)
  for (let k in child) {
    let p = res[k]
    let c = child[k]
    if (p && !Array.isArray(p)) {
      p = [p]
    }
    res[k] = p
      ? p.concat(c)
      : Array.isArray(c) ? c : [c]
  }
  return res
}
