import config from './config'
import Vue from './instance/index'


Object.defineProperty(Vue.prototype, '$isServer', {
  get: () => config._isServer
})

Vue.version = '2.0.0'

export default Vue