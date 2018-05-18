/**
 * 一个基于 Least Recently Used (LRU算法)的双向链表缓存,
 * 缓存最近使用频繁的数据,如果数量超出限制,将会丢弃最近使用最少的
 */

export default class Cache {
  constructor (limit) {
    this.size = 0
    this.limit = limit
    this.head = this.tail = undefined
    this._keymap = Object.create(null)
  }

  /**
   * 将键-值关联的数据放入缓存,空间充足的话,返回undefined
   * 否则返回删除的项目
   * 
   * @param {String} key 
   * @param {*} value 
   * @return {Entry|undefined}
   */
  put (key, value) {
    let removed
    // 首先判断在缓存中是否存在
    let entry = this.get(key, true)
    if (!entry) {
      if (this.size === this.limit) {
        removed = this.shift()
      }
      entry = {
        key
      }
      this._keymap[key] = entry
      // tail不存在,
      if (this.tail) {
        this.tail.newer = entry
        entry.older = this.tail
      } else {
        this.head = entry
      }
      this.tail = entry
      this.size++
    }
    entry.value = value
    return removed
  }

  /**
   * 获取缓存中的数据,返回关联key的值,缓存中没有则返回undefined
   * 
   * @param {String} key 
   * @param {Boolean} returnEntry 
   * @return {Entry|*}
   */
  get (key, returnEntry) {
    let entry = this._keymap[key]
    if (entry === undefined) return 
    // 当前值最新,直接return
    if (entry === this.tail) {
      return returnEntry
        ? entry
        : entry.value
    }
    // 有比当前更新的值
    if (entry.newer) {
      // 如果当前entry是head,直接将head指向修改到当前entry的newer
      if (entry === this.head) {
        this.head = entry.newer
      }
      entry.newer.older = entry.older
    }
    // 有比当前更老的值
    if (entry.older) {
      entry.older.newer = entry.newer
    }
    entry.newer = undefined
    entry.older = this.tail
    if (this.tail) {
      this.tail.newer = entry
    }
    this.tail = entry
    return returnEntry
      ? entry
      : entry.value
  }

  /**
   * 删除缓存中最近最少使用的(最老的)条目,返回移除的条目,
   * 如果缓存为空则返回undefined
   */
  shift () {
    let entry = this.head
    if (entry) {
      this.head = this.head.newer
      this.head.older = undefined
      entry.newer = entry.older = undefined
      this._keymap[entry.key] = undefined
      this.size--
    }
    return entry
  }
}