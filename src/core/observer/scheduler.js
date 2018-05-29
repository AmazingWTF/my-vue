
import config from '../config'

import {
  warn,
  nextTick,
  devtools
} from '../util/index'

const queue = []
let has = {}
let circular = {}
let waiting = false
let flushing = false
let index = 0


function resetSchedulerState () {
  queue.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}


function flushSchedulerQueue () {
  flushing = true

  queue.sort((a, b) => a.id - b.id)

  for (index = 0; index < queue.length; index++) {
    const watcher = queue[index]
    const id = watcher.id
    has[id] = null
    watcher.run()
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop ' + (watcher.user ?
              `in watcher with expression "${watcher.expression}"` :
              `in a component render function.`),
            watcher.vm)
        break
      }
    }
  }

  if (devTools && config.devtools) {
    devtools.emit('flush')
  }

  resetSchedulerState()
}


export function queueWatcher (watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {

      let i = queue.length - 1
      while (i >= 0 && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher)
    }
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}