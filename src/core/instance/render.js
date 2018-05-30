import config from '../config'
import VNode, {
  emptyVNode,
  cloneVNode,
  cloneVNodes
} from '../vdom/vnode'
import { normalizeChildren } from '../vnode/helpers'
import {
  warn,
  formatComponentName,
  bind,
  isObject,
  toObject,
  nextTick,
  resolveAsset,
  _toString,
  toNumber,
  looseEqual,
  looseIndexOf
} from '../util/index'

import { createElement } from '../vdom/create-element'

export function initRender (vm) {
  vm.$vnode = null  // the placeholder node in parent tree
  vm._vnode = null  // the root of the child tree 
  vm._staticTrees = null
  vm._renderContext = vm.$options._parentVnode && vm.$options._parentVnode.context
  /* vm.$slots = resolveSlots(vm.$options._renderChildren, vm._renderContext) */
  vm.$createElement = bind(createElement, vm)
  // 如果vm有el选项，则挂载数据到元素上
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

export function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this)
  }

  Vue.prototype._render = function () {
    const vm = this
    const {
      render,
      staticRenderFns,
      _parentVnode
    } = vm.$options

    /* if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (const key in vm.$slots) {
        vm.$slots[key] = cloneVNode(vm.$slots[key])
      }
    } */

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = []
    }

    // 设置parent vnode，允许渲染函数访问placeholder节点的数据
    vm.$vnode = _parentVnode

    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        warn(`Error when rendering ${formatComponentName(vm)}`)
      }
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm)
      } else {
        if (config._isServer) {
          throw e
        } else {
          setTimeout(() => {
            throw e
          }, 0)
        }
      }
      // 返回上一个组件防止错误导致的空白组件(我理解为空白组件无法定位)
      vnode = vm._vnode
    }

    // 返回空vnode，因为渲染函数出错
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. ' +
          'Render function should return a single root node.',
          vm
        )
      }
      vnode = emptyVNode()
    }
    vnode._parentVnode = _parentVnode
    return vnode
  }

  // 
  Vue.prototype._h = createElement
  // mustache的toString方法
  Vue.prototype._s = _toString
  // 转为数字
  Vue.prototype._n = toNumber
  // 空vnode
  Vue.prototype._e = emptyVNode
  // 浅相等
  Vue.prototype._q = looseEqual
  // 数组的浅层indexOf(一维)
  Vue.prototype._i = looseIndexOf

  // 按照index渲染一个static tree
  Vue.prototype._m = function renderStatic (index, isInFor) {
    let tree = this._staticTrees[index]
    // 如果已经存在渲染完成的static tree并且不在v-for中
    // 可以直接通过浅克隆复用这个相同的tree
    if (tree && !isInFor) {
      return Array.isArray(tree) ? cloneVNodes(tree) : cloneVNode(tree)
    }
    // 否则，渲染一个新的tree
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy)
    if (Array.isArray(tree)) {
      for (let i = 0; i < tree.length; i++) {
        tree[i].isStatic = true
        tree[i].key = `__static__${index}_${i}`
      }
    } else {
      tree.isStatic = true
      tree.key = `__static__${index}`
    }
    return tree
  }

  // filter指令的解决(如果父级没有相应的数据，就访问自身数据)
  const identity = _ => _
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  // 渲染v-for
  Vue.prototype._l = function renderList (val, render) {
    let ret, i, l, keys, key
    if (Array.isArray(val)) {
      ret = new Array(val)
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i)
      }
    } else if (typeof val === 'number') {
      ret = new Array(val)
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i)
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], key, i)
      }
    }
    return ret
  }

  // 渲染slot
  Vue.prototype._t = function (name, fallback) {
    const slotNodes = this.$slots[name]
    if (slotNodes && process.env.NODE_ENV !== 'production') {
      slotNodes._rendered && warn(
        `Duplicate presence of slot "${name}" found in the same render
        tree - this will likely cause render errors.`,
        this
      )
      slotNodes._rendered = true
    }
    return slotNodes || fallback
  }

  // 
  Vue.prototype._b = function bindProps (data, value, asProp) {
    if (value) {
      if (!isObject(value)) {
        process.env.NODE_ENV !== 'production' && 
        warn(`v-bind without argument expects an Object or Array value`, this)
      } else {
        if (Array.isArray(value)) {
          value = toObject(value)
        }
        for (const key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key]
          } else {
            const hash = asProp || config.mustUseProp(key) ?
              data.domProps || (data.domProps = {}) :
              data.attrs || (data.attrs = {})
          }
        }
      }
    }
    return data
  }

  // 返回v-on的keyCodes
  Vue.prototype._k = function getKeyCodes (key) {
    return config.keyCodes[key]
  }
}

// 处理slots
export function resolveSlots (renderChildren, context) {
  const slots = {}
  if (!renderChildren) {
    return slots
  }
  const children = normalizeChildren(renderChildren) || []
  const defaultSlot = []
  let name, child
  for (let i = 0, l = children.length; i < l; i++) {
    child = children[i]
    
    if (child.context === context && child.data && (name = child.data.slot)) {
      const slot = slots[name] || (slots[name] = [])
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children)
      } else {
        slot.push(child)
      }
    } else {
      defaultSlot.push(child)
    }
  }

  if (defaultSlot.length && !(defaultSlot.length === 1 &&
        (defaultSlot[0].text === '' || defaultSlot[0].isComment))
      ) {
        slots.default = defaultSlot
  }
  return slots
}