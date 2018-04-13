export default function (Vue) {
  
  Vue.prototype._init = function (options) {

    // a flag to avoid this being observed
    this._isVue = true

    this._data = {}
    
    // initialize data observation and scope inheritance.
    // 初始化数据观察者和继承范围
    this._initData()

    
  }
}
