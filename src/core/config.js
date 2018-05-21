import { no, noop } from 'shared/util'

const config = {
  // option合并策略
  optionMergeStrategies: Object.create(null),

  // 是否显示warnings
  silent: false,

  // 是否打开devtools
  devtools: process.env.NODE_ENV !== 'production',

  // 监视错误的处理方法
  errorHandler: null,

  // 忽略某些自定义元素
  ignoredElements: null,

  // Custom user key aliases for v-on
  keyCodes: Object.create(null),

  // 如果标签是否为保留字,则不能注册为组件,并且可能被覆盖(platform-dependent)
  isReservedTag: no,

  // 标签是否为未知元素(platform-dependent)
  isUnknownElement: no,

  // 获取元素的命名空间
  getTagNamespace: noop,

  // 检测是否一个属性必须通过property绑定,比如value (platform-dependent)
  mustUseProp: no,

  // 组件可以拥有的资源类型列表
  _asserTypes: ['component', 'directive', 'filter'],


  // 生命周期列表
  _lifecycleHooks: ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestory', 'destoryed', 'activated', 'deactivated'],

  // Max circular updates allowed in a scheduler flush cycle.
  _maxUpdateCount: 100,

  // 是否为服务端渲染
  _isServer: process.env.VUE_ENV === 'server'
}

export default config