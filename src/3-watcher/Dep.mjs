export class Dep {
  constructor () {
    this.subs = []
  }

  addSub (sub) {
    if (!this.subs.includes(sub)) {
      this.subs.push(sub)
    }
  }

  removeSub (sub) {
    const index = this.subs.indexOf(sub)
    if (index >= 0) {
      this.subs.splice(index, 1)
    }
  }

  notify () {
    this.subs.forEach(sub => sub.update())
  }
}

Dep.target = null
