export function updateListeners (on, oldOn, add, remove) {
  let name, cur, old, fn, event, capture
  for (name in on) {
    cur = on[name]  // 事件name的事件列表(或者处理过的具有 invoker 属性)
    old = oldOn[name]
    if (!old) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (Array.isArray(cur)) {
        add(event, cur.invoker = arrInvoker(cur), capture)
      } else {
        if (!cur.invoker) {
          fn = cur
          cur = on[name] = {}
          cur.fn = fn
          cur.invoker = fnInvoker(cur)
        }
        add(event, cur.invoker, capture)
      }
    } else if (cur !== old) {
      // 新旧事件列表长度不同，以新的为准
      if (Array.isArray(old)) {
        old.length = cur.length
        for (let i = 0; i < old.length; i++) old[i] = cur[i]
        on[name] = old
      } else {
        old.fn = cur
        on[name] = old
      }
    }
  }
  for (name in oldOn) {
    // 旧的事件不存在新列表中，移除事件
    if (!on[name]) {
      event = name.charAt(0) === '!' ? name.slice(1) : name
      remove(event, oldOn[name].invoker)
    }
  }
}

// events.js 中的引用了 updateListeners(listeners, oldListeners || {}, on, off)
// 其中 on 和 off 分别是绑定了上下文的 $on 和 $off 方法
// on 和 off 映射到当前文件中的 updateListeners 函数参数，是 add 和 remove
// 遍历事件列表，数组或者非数组分别用 arrInvoker 和 fnInvoker 处理

// invoker 处理逻辑：
// 本身的参数用来处理事件列表，return的参数用来接收emit的参数，传递给每一个回调
function arrInvoker (arr) {
  return function (ev) {
    const single = arguments.length === 1
    for (let i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments)
    }
  }
}

function fnInvoker (o) {
  return function (ev) {
    const single = arguments.length === 1
    single ? o.fn(ev) : o.fn.apply(null, arguments)
  }
}
