
import { looseEqual, looseIndexOf } from '../../../../shared/util'
import { nextTick, isAndroid, isAndroid, isIE9, isIE, isEdge, warn } from '../../../../core/util'

// 可使用model指令的标签
const modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z\-]*)?$/

if (isIE9) {
  // IE9 对input事件的hack
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement
    if (el && el.vmodel) {
      trigger(el, 'input')
    }
  })
}

export default {
  bind(el, binding, vnode) {
    if (!modelableTagRE.test(vnode.tag)) {
      warn(`v-model is not suported on element type: <${vnode.tag}>. ` +
       `If you are working with contenteditable, it\'s recommended to ` + 
       `wrap a library dedicated for that purpose inside a custom component.`,
        vnode.context)
    }
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      if (isIE || isEdge) {
        const cb = () => {
          setSelected(el, binding, vnode.context)
        }
        nextTick(cb)
        setTimeout(cb, 0)
      }
    } else if (vnode.tag === 'textarea' || el.type === 'text') {
      if (!isAndroid) {
        el.addEventListener('compositionstart', onCompositionStart)
        el.addEventListener('compositionend', onCompositionEnd)
      }
      
      if (isIE9) {
        el.vmodel = true
      }
    }
  },
  componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      const needReset = el.multiple ? binding.value.some(v => hasNoMatchingOption(v, el.options)) : hasNoMatchingOption(binding.value, el.options)
      if (needReset) {
        trigger(el, 'change')
      }
    }
  }
}

function trigger (el, type) {
  const e = document.createElement('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}