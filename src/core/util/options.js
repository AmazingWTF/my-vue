import {
  isObject,
  isPlainObject,
  hasOwn,
  camelize,
  capitalize,
  isBuiltInTag
} from 'shared/util'

/**
 * 确保component的options转化成真正的构造函数
 */
function normalizeComponents (options) {
  if (options.componnets) {
    const components = options.components
    let def
    for (const key in components) {
      const lower = key.toLowerCase()
      if (isBuiltTag(lower) || config.isReservedTag(lower)) {
        warn(`Do not use built-in or reserved HTML elements as component id: ${key}`)
        continue
      }
      def = components[key]
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def) // 关键
      }
    }
  }
}

/**
 * 确保所有的props是以驼峰命名的对象格式
 */
function normalizeProps (options) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name =camelize(val)
        res[name] = { type: null }
      } else {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) ? val : { type: val }
    }
  }
  options.props = res
}

/**
 * 将原生的函数directives转成object格式
 */
function normalizeDirectives (options) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

/**
 * 将2个option对象转化成一个新的
 * 实例化和继承使用到的核心功能
 */
export function mergeOptions (parent, child, vm) {
  normalizeComponents(child)
  normalizeProps(child)
  normalizeDirectives(child)
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function' ?
      mergeOptions(parent, extendsFrom.options, vm) :
      mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      let mixin = child.mixins[i]
      if (mixin.prototype instanceof Vue) {
        mixin = minxin.options
      }
      parent = mergeOptions(parent, minxin, vm)
    }
  }
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Resolve an asset.
 * 此函数的意义在于，child实例需访问祖先链上定义的assets
 */
export function resolveAsset (options, type, id, warnMissing) {
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  const res = assets[id] || assets[camelize(id)] || assets[capitalize(camelize(id))]
  if (warnMissing && !res) {
    warn(`Failed to resolve ${type.slice(0, -1)}: ${id}`, options)
  }
  return res
}