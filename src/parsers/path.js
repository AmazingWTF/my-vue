// 未完成

import { parseExpression } from './expression'
import {
  isLiteral,
  stripQuotes,
  isObject,
  isArray,
  warn,
  set,
  nextTick
} from '../util/index'
import Cache from '../cache'
import { appendFileSync } from 'fs';

let pathCache = new Cache(1000)

const 
  // actions
  APPEND = 0,
  PUSH = 1,
  INC_SUB_PATH_DEPTH = 2,
  PUSH_SUB_PATH = 3,
  
  // status
  BEFORE_PATH = 0,
  IN_PATH = 1,
  BEFORE_IDENT = 2,
  IN_IDENT = 3,
  IN_SUB_PATH = 4,
  IN_SINGLE_QUOTE = 5,
  IN_DOUBLE_QUOTE = 6,
  AFTER_PATH = 7,
  ERROR = 8

let pathStateMachine = []

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'indent': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
}

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
}

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
}

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
}

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
}

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
}

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
}

/**
 * 根据特征判断键path的类型
 * 
 * @param {Char} ch 
 * @return {String} type
 */
function getPathCharType (ch) {
  if (ch === undefined) {
    return 'eof'
  }

  const code = ch.charCodeAt(0)

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30: // 0
      return ch

    case 0x5F: // _
    case 0x24: // $
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return 'ws'
  }

  // a-z, A-Z
  if (
    (code >= 0x61 && code <= 0x7A) ||
    (code >= 0x41 && code <= 0x5A)
  ) {
    return 'ident'
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number'
  }

  return 'else'

}


/**
 * 格式化一各子路径,如果是一个字符串或者数字,直接返回它的plain form
 * 否则就添加一个 '*' 作为前缀
 */

function formatSubPath (path) {
  let trimmed = path.trim()

  if (path.charAt(0) === '0' && isNaN(path)) {
    return false
  }
  return isLiteral(trimmed)
    ? stripQuotes(trimmed)
    : '*' + trimmed
}



function parse (path) {
  let keys = []
  let index = -1
  const mode = BEFORE_PATH
  let subPathDepth = 0
  let c, newChar, key, type, transition, action, typeMap

  let actions = []

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key)
      key = undefined
    }
  }

  actions[APPEND] = function () {
    if (key === undefined){
      key = newChar
    } else {
      key += newChar
    }
  }

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]()
    subPathDepth++
  }

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--
      mode = IN_SUB_PATH
      actions[APPEND]()
    } else {
      subPathDepth = 0
      key = formatSubPath[key]
      if(key === false) {
        return false
      } else {
        actions[PUSH]()
      }
    }
  }

  function mabeUnescapeQuote () {
    let nextChar = path[index + 1]
    if ((mode === IN_SINGLE_QUOTE && nextChar === "'") ||
        (mode === IN_DOUBLE_QUOTE && nextChar === "'")) {
      index++
      newChar = '\\' + nextChar
      actions[APPEND]()
      return true
    }
  }

  while (mode != null) {
    index++
    c = path[index]

    if (c === '\\' && maybeUnescapeQuote()) {
      continue
    }

    type = getPathCharType(c)
    typeMap = pathStateMachine[mode]
    transition = typeMap[type] || typeMap['else'] || ERROR

    if (transition === ERROR) {
      return // parse error
    }

    mode = transition[0]
    action = actions[transition[1]]
    if (action) {
      newChar = transition[2]
      newChar = newChar === undefined
        ? c
        : newChar
      if (action() === false) {
        return
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path
      return keys
    }
  }
}

/**
 * 外用的parse方法,首先查看是否有缓存
 * 
 * @param {String} path 
 * @return {Array|undefined}
 */
export function parsePath (path) {
  const hit = pathCache.get(path)
  if (!hit) {
    hit = parse(path)
    if (hit) {
      pathCache.put(path, hit)
    }
  }
  return hit
}

/**
 * 从一个对象的字符串路径中get值
 * 
 * @param {Object} obj 
 * @param {String} path 
 */
export function getPath(obj, path) {
  return parseExpression(path).get(obj)
}

// 警告不要在vm实例上设置不存在的root path
const warnNonExistent = function (path, vm) {
  warn(
    `You are setting a non-existent path ${path.raw}
    on a vm instance. Consider pre-initializing the property
    with the "data" option for more reliable reactivity and 
    better performance.`,
    vm
  )
}

// 通过一个路径将值设置到对象上
export function setPath (obj, path, val) {
  const original = obj
  if (typeof path === 'string') {
    path = parse(path)
  }
  if (!path || !isObject(obj)) {
    return false
  }
  let last, key
  for (let i = 0, l = path.length; i < l; i++) {
    last = obj
    key = path[i]
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original)
    }
    if (i < l -1) {
      obj = obj[key]
      if (!isObject(obj)) {
        obj = {}
        if (last._isVue) {
          warnNonExistent(path, last)
        }
        set(last, key, obj)
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val)
      } else if (key in obj) {
        obj[key] = val
      } else {
        if (obj._isVue) {
          warnNonExistent(path, obj)
        }
        set(obj, key, val)
      }
    }
  }
  return true
}