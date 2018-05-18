import initMixin from './internal/init'
import stateMixin from './internal/state'
import eventsMixin from './internal/events'
import lifecycleMixin from './internal/lifecycle'
import miscMixin from "./internal/misc"

export default class Vue {
  constructor (options) {
    this._init(options)
  }
}

initMixin(Vue)
stateMixin(Vue)