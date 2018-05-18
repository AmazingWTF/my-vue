



// 去除父级节点中可能存在的头/尾空文本以及注释节点
export function trimNode (node) {
  let child
  while (child = node.firstChild, isTrimmable(child)) {
    node.removeChild(child)
  }
  while (child = node.lastChild, isTrimmable(child)) {
    node.removeChild(child)
  }
}

function isTrimmable (node) {
  return node && (
    // 3: Text  8: Comment
    (node.nodeType === 3 && !node.data.trim()) ||
    node.nodeType === 8
  )
}

/**
 * 检查一个标签是否为template标签
 * 注意如果此template出现在一个SVG中,将会被转为小写 (什么鬼?)
 * @param {Element} el 
 */
export function isTemplate (el) {
  return el.tagName && 
    el.tagName.toLowerCase() === 'template'
}

export function isFragment (node) {
  return node && node.nodeType === 11
}

