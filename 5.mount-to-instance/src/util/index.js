export const isArray = Array.isArray

export const noop = function () {}

export function mergeOptions (parent, child) {
  //  data  methods  watch  computed
  let options = {}

  // 合并data，同名覆盖
  options.data = mergeData(parent.data, child.data)
  // 合并methods，同名覆盖
  options.methods = Object.assign(parent.methods || {}, child.methods)
  // 合并watch，同名合并成为数组
  options.watch = mergeWatch(parent.watch, child.watch)
  // 合并computed，同名覆盖
  options.computed = Object.assign(parent.computed || {}, child.computed)

  return options
}

function mergeData(parentValue, childValue) {
  if (!parentValue) {
    return childValue
  }
  if (!childValue) {
    return parentValue
  }
  return function mergeFnc () {
    return Object.assign(parentValue.call(this), childValue.call(this))
  }
}

// watcher比较特殊，需要全部保留，放在数组中
function mergeWatch (parentVal, childVal) {
  if (!childVal) return Object.assign(parentVal || {})
  let ret = Object.assign({}, parentVal)
  for (let key in childVal) {
    let parent = ret[key]
    let child = childVal[key]
    if (parent && !isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : isArray(child) ? child : [child]
  }
  return ret
}