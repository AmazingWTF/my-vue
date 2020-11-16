
export class Dep {
  constructor () {
    this.subs = []
  }

  // 添加依赖
  addSub (sub) {
    const index = this.subs.some(s => sub === s)
    if (!index) {
      this.subs.push(sub)
    }
  }

  // 移除依赖
  removeSub (sub) {
    const index = this.subs.findIndex(s => s === sub)
    if (index >= 0) {
      this.subs.splice(index, 1)
    }
  }

  // 执行依赖
  notify (oldVal, newVal) {
    this.subs.forEach(sub => {
      sub(oldVal, newVal)
    })
  }
}

Dep.target = null
