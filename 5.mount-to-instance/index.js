import Dep from './observer/Dep'
import Watcher from './watcher'
import observe from './observer/observer'

export default class Vue {
  constructor () {
    Object.assign(this, {
      Dep,
      Watcher,
      observe
    })
  }
}
