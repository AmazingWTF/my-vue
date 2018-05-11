
let uid = 0

export default class Dep {
  constructor () {
    this.subs = []
    this.id = uid++
  }

  addSub (sub) {
    this.subs.push(sub)
  }
  removeSub (sub) {
    const index = this.subs.indexOf(sub)
    if (index > -1) {
      this.subs.splice(index, 1)
    }
  }
  notify () {
    this.subs && this.subs.forEach(sub => sub.update())
  }

}
Dep.target = null