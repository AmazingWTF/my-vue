import Vue from "../instance";
import config from '../config'
import { warn } from './debug'
import { 
  extend,
  isObject,
  isPlainObject,
  hasOwn,
  camelize,
  capitalize,
  isBuiltInTag
} from "../../shared/util";






// 确保component的options转化为真实的构造函数
function normalizeComponents (options) {
  if (options.components) {
    const components = options.components
    let def
    for (const key in components) {
      const lower = key.toLowerCase()
      if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
        warn(`
          Do not use built-in or reserved HTML elements as component
          id: ${key}
        `)
        continue
      }
      def = components[key]
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def)
      }
    }
  }
}

// 将所有的props属性规范为基于对象的格式,并且将键名统一为驼峰
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
        name = camelize(val)
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

// 将原生函数形式的directives统一为对象格式
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
 * 将两个option对象合并成为一个
 * 同时用于实例化和继承上的核心方法
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
        mixin = mixin.options
      }
      parent = mergeOptions(parent, mixin, vm)
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