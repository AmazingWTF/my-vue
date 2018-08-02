import { no, noop } from 'shared/util'

const config = {
  // mergeOptions策略 (used in core/util/options)
  optionMergeStrategies: Object.create(null),

  // 是否隐藏警告
  silent: false,

  // 是否打开devtools
  devtools: process.env.NODE_ENV !== 'production',

  // 错误处理
  errorHandler: null,

  // 忽略某些自定义元素
  ignoreElements: null,

  // 为v-on自定义的键盘别名
  keyCodes: Object.create(null),

  // 检查标签是否是不能被注册为组件的保留字 (platform-dependent & may be overwritten)
  isReservedTag: no,

  // 检查标签是否是一个未知的元素 (platform-dependent)
  isUnknownElement: no,

  // 取得一个元素的命名空间
  getTagNamespace: noop,

  // 检查一个属性是否必须用property绑定，比如value (platform-dependent)
  mustUseProp: no,

  // 一个组件可以拥有的资源类型列表
  _assetTypes: ['component', 'ditective', 'filter'],

  // 生命周期的列表
  _lifecycleHooks: ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdated', 'updated', 'beforeDestory', 'destroyed', 'actived', 'deactivated'],

  // 一个时间循环最多的循环更新
  _maxUpdateCount: 100,

  // 服务器渲染？
  _isServer: process.env.VUE_ENV === 'server'
}

export default config
