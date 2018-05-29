import {
  no,
  noop
} from './shared/util'

const config = {
  // 合并options的策略(用在 core/util/options)
  optionMergeStrategies: Object.create(null),

  // 是否显示warnings
  slient: false,

  // 是否打开devtools
  devtools: process.env.NODE_ENV !== 'production',

  // 监视错误的处理程序
  errorHandler: null,

  // 忽略某些自定义的元素
  ignoredElements: null,

  // 为v-on自定义的别名
  keyCodes: Object.create(null),

  // 检测标签是否是不能注册为组件的保留字
  isReservedTag: no,

  // 元素是否为未知元素
  isUnknownElement: no,

  // 或者一个元素的命名空间
  getTagNamespace: noop,

  // 检查属性是否必须作为属性绑定，比如 value 等
  mustUseProp: no,

  // 一个组件可以拥有的资源列表
  _assetTypes: ['component', 'directive', 'filter'],

  // 生命周期钩子
  _lifecycleHooks: ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'update', 'beforeDestory', 'destroyed', 'activated', 'deactivated'],

  // max circular updates allowed in a scheduler flush cycle.
  _maxUpdateCount: 100,

  // 是否服务端渲染
  _isServer: process.env.VUE_ENV === 'server'
}

export default config