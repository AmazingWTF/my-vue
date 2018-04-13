import {
  warn,
  nextTick
} from './util/index'
import { BADQUERY } from 'dns';
import { Watcher } from 'rollup';


let queue = [],
  userQueue = [],
  has = {},
  circular = {},
  waiting = false


/**
 * Reset the batcher's state.
 */

function resetBatcherState () {
  queue.length = 0
  userQueue.length = 0
  has = {}
  circular = {}
  waiting = false
}


/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 * 
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

export function pushWatcher (watcher) {
  const id = watcher.id
  // 如果此watcher已经存在，那么就不用加入队列了， 
  // 这样无论一个数据更新多少次，Vue都只更新一次dom ------> why?
  if (has[id] == null) {
    const q = watcher.user
      ? userQueue
      : queue
    // has[id]记录了这个watcher在队列中的下标
    // 主要是为了判断是否出现了循环更新：你更新我后我更新你 -------> why?
    has[id] = q.length
    q.push(watcher)
    // queue the flush - 我理解为将watcher顺序放入队列
    if (!waiting) {
      waiting = true
      nextTick(flushBatcherQueue)
    }
  }
}