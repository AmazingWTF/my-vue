import Cache from '../cache'
import {
  inBrowser,
  trimNode,
  isTemplate,
  isFragment
} from '../util/index'

const templateCache = new Cache(1000)
const idSelectorCache = new Cache(1000)

const map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [
    2,
    '<table><tbody></tbody><colgroup>',
    '</colgroup></table>'
  ]
}

map.td =
map.th = [
  3,
  '<table><tbody><tr>',
  '</tr></tbody></table>'
]

map.option =
map.optgroup = [
  1,
  '<select multiple="mutiple"',
  '</select>'
]

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>']

map.g =
map.defs =
map.symbol =
map.use =
map.image =
map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [
  1,
  '<svg ' +
    'xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'xmlns:ev="http://www.w3.org/2001/xml-events"' +
    'version="1.1">',
  '</svg>'
]

/**
 * 检查是否是一个带有DocumentFragment内容的节点
 * 
 * @param {Node} node 
 * @return {Boolean}
 */
function isRealTemplate (node) {
  return isTemplate(node) && isFragment(node.content)
}


const tagRE = /<([\w:-]+)/
const entityRE = /&#?\w+?;/
const commentRE = /<!--/

/**
 * 将一个字符串模板转化为一个DocumentFragment
 * 根据标签选择正确的元素包裹, 
 * 
 * @param {String} templateString 
 * @param {Boolean} raw 
 * @return {DocumentFragment}
 */
function stringToFragment (templateString, raw) {
  // 尝试命中缓存
  const cacheKey = raw
    ? templateString
    : templateString.trim()
  const hit = templateCache.get(cacheKey)
  if (hit) {
    return hit
  }

  let frag = document.createDocumentFragment()
  const tagMatch = templateString.match(tagRE)
  const entityMatch = entityRE.test(templateString)
  const commentMatch = commentRE.test(templateString)

  if (!tagMatch && !entityMatch && !commentMatch) {
    frag.appendChild(
      document.createTextNode(templateString)
    )
  } else {
    // 原理:
    // 不能直接创建元素然后innerHTML来盛放template,因为元素类型很多,
    // 也不能直接用outerHTML,不能设置没有父元素的outerHTML
    // 所以根据模板中第一个标签,按照map中预设的内容,给模板设置父元素,
    // 将模板嵌入合适的父元素中,在层层进入父元素获取真正的模板元素
    const tag = tagMatch && tagMatch[1]
    const wrap = map[tag] || map.efault
    const depth = wrap[0]   // 包裹的层数
    const prefix = wrap[1]  // 父元素的开始标签(们)
    const suffix = wrap[2]  // 父元素的结束标签(们)
    const node = document.createElement('div')
    // node的内容为拼接完成的字符串(将父元素拼接上了)
    node.innerHTML = prefix + templateString + suffix
    // 找到正确的dom
    while (depth--) {
      node = node.lastChild
    }

    let child
    while (child = node.firstChild) {
      // 将node的所有子节点提取到frag中(appendChild会删除原先的)
      frag.appendChild(child)
    }
  }
  if (!raw) {
    trimNode(frag)
  }
  templateCache.put(cacheKey, frag)
  return frag
}

/**
 * 将模板node转化为DocumentFragment(和上一个目的相同)
 * 
 * @param {Node} node 
 * @return {DocumentFragment}
 */
function nodeToFragment (node) {
  // 在node是template的情况下,尽管他的content已经是一个DocumentFragment,
  // 但是因一些浏览器的bug,还取出innerHTML再stringToFragment一遍
  if (isRealTemplate(node)) {
    return stringToFragment(node.innerHTML)
  }
  // script template 
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent)
  }
  // normal node, clone it to avoid mutating the original
  const clonedNode = cloneNode(node)
  let frag = document.createDocumentFragment()
  let child
  while (child = clonedNode.firstChild) {
    frag.appendChild(child)
  }
  trimNode(frag)
  return frag
}

// 检测Safari浏览器上面的模板克隆bug是否存在
const hasBrokenTemplate = (function () {
  if (inBrowser) {
    let a = document.createElement('div')
    a.innerHTML = '<template>1</template>'
    return !a.cloneNode(true).firstChild.innerHTML
  } else {
    return false
  }
})()

// 检测 IE10/11 上对textarea的placeholder属性克隆的bug
const hasTextareaCloneBug = (function () {
  if (inBrowser) {
    let t = document.createElement('textarea')
    t.placeholder = 't'
    return t.cloneNode(true).value === 't'
  } else {
    return false
  }
})()

/**
 * 1. Safari在克隆template结构有bug,手动克隆所有的template实例
 * 2. IE10/11克隆之后placeholder属性跑到了value里,将value正确设置
 * 
 * @param {Element|DocumentFragment} node 
 * @return {Element|DocumentFragment}
 */
export function cloneNode (node) {
  if (!node.querySelectorAll) {
    return node.cloneNode()
  }
  const res = node.cloneNode(true)
  let i, original, cloned
  // Safari的某些老版本在克隆元素时,如果里面有template标签,
  // 那么克隆之后生成的新dom会丢失template里的内容
  if (hasBrokenTemplate) {
    let tempClone = res
    if (isRealTemplate(node)) {
      node = node.content
      tempClone = res.content
    }
    original = node.querySelectorAll('template')
    if (original.length) {
      cloned = tempClone.querySelectorAll('template')
      i = cloned.length
      while (i--) {
        cloned[i].parentNode.repaceChild(
          cloneNode(original[i]),
          cloned[i]
        )
      }
    }
  }
  // IE的textarea存在bug,复制后会将placeholder的内容放在value里面
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value
    } else {
      original = node.querySelectorAll('textarea')
      if (original.length) {
        cloned = res.querySelectorAll('textarea')
        i = cloned.length
        while (i--) {
          cloned[i].value = original[i].value
        }
      }
    }
  }
  return res
}

/**
 * 
 * @param {*} template 
 *        Possible values inclued:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone 
 * @param {Boolean} raw 
 *        内联HTML插值,不检查id选择符并且保留空格
 */
export function parseTemplate (template, shouldClone, raw) {
  let node, frag
  // 如果template已经是一个DocumentFragment了,直接返回
  if (isFragment(template)) {
    trimNode(template)
    return shouldClone
      ? cloneNode(template)
      : template
  }

  if (typeof template === 'string') {
    // id 选择器
    if (!raw && template.charAt(0) === '#') {
      frag = idSelectorCache.get(template)
      if (!frag) {
        node = document.getElementById(template.slice(1))
        if (node) {
          frag = nodeToFragment(node)
          // 将其存入缓存
          idSelectorCache.put(template, frag)
        }
      }
    } else {
      // 普通字符串模板
      frag = stringToFragment(template, raw)
    }
  } else if (template.nodeType) {
    // 直接是一个node
    // template是一个template元素也会进入此处
    frag = nodeToFragment(template)
  }

  return frag && shouldClone
    ? cloneNode(frag)
    : frag
}