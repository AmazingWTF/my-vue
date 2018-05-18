import { warn } from '../util/index'
import { parsePath, setPath } from './path'
import Cache from '../cache'

const expressionCache = new Cache(100)

// 允许的关键字
const allowedKeywords = 
  `Math,Date,this,true,false,null,undefined,Infinity,NaN,
   isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,
   encodeURIComponent,parseInt,parseFloat
  `
const allowedKeywordsRE = 
  new RegExp(`^(${allowedKeywords.replace(/,/g, '\\b|')}\\b`)

// 在表达式中没有意义的关键字
const improperKeywords =
  `break,case,class,catch,const,continue,debugger,default,
   delete,do,else,export,extends,finally,for,function,if,
   import,in,instanceof,let,return,super,switch,throw,try,
   var,while,with,yield,enum,await,implements,package,
   protected,static,interface,private,public
  `

const wsRE = /\s/g
const newlineRE = /\n/g
const saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g
const pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
// indentRE匹配第一个字符不是标识符而后面紧跟着标识符的情况 比如'vue+jQuery'中的'+jQuery',捕获'jQuery'
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g
const literalValueRE = /^(?:true|false|null|undefined|Infinity|NaN)$/

function noop () {}

/**
 * Save / Rewrite / Restore
 * 
 * 当重写在expression中发现的路径时,可能会在对象的文本属性和字符串
 * 中发现相同的字符序列,因此我们移除并且缓存这写部分在一个临时数组,
 * 并且重写之后恢复
 */
let saved = []

/**
 * 创建一个getter函数,需要eval(什么鬼?)
 * 
 * @param {String} body
 * @param {Function|undefined}
 */

function makeGetterFn (body) {
  try {
    return new Function('scope', `return ${body};`)
  } catch (e) {
    if (e.toString().match(/unsafe-eval|CSP/)) {
      warn(`
        It seems you are using the default build of Vue.js in an enviroment
        with Content Security Policy that prohibits unsafe-eval.
        Use the CSP-compliant build instead:
        http://vuejs.org/guide/installation.html#CSP-compliant-build
      `)
    } else {
      warn(`
        Invalid expression.
        Generated function body: ${body}
      `)
    }
    return noop
  }
}


function compileSetter (exp) {
  let path = parsePath(exp)
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val)
    }
  } else {
    warn(`Invalid setter expression ${exp}`)
  }
}


export function parseExpression (exp, needSet) {
  exp = exp.trim()
  let hit = expressionCache.get(exp)
  if (hit) {
    if (needSet && !hit.exp) {
      hit.set = compileSetter(hit.exp)
    }
    return hit
  }
  let res = { exp }
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
    ? makeGetterFn('scope.' + exp)
    : compileGetter(exp)

  if (needSet) {
    res.set = compileSetter(exp)
  }
  expressionCache.put(exp, res)
  return res
}

/**
 * 检查表达式是否是简单路径
 * a['b']  a.b.c  true  false  null  Math.max  这些都是simple path
 * a=true  a/=2  hello()  这种不是simple path
 * 
 * @param {String} exp 
 * @return {Boolean}
 */
export function isSimplePath (exp) {
  return pathTestRE.test(exp) &&
    !literalValueRE.test(exp) &&
    exp.slice(0, 5) !== 'Math.'
}