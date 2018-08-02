import { initMixin } from './init'


function Vue (options) {
  if (!(this instanceof Vue)) {
    wran('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)