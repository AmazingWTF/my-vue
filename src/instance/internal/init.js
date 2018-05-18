import { mergeOptions } from '../../util/index'

let uid = 0

export default function (Vue) {
  /**
   * The 
   */

  Vue.prototype._init = function (options) {
    options = options || {}

    this.$el = null
    this.$parent = options.parent
    this.$root = this.$parent
      ? this.$parent.$root
      : this
    this.$children = []
    this.$refs = {}       // chlid vm references
    this.$els = {}        // element references
    this._watchers = []   // all watchers
    this._directives = [] // alldirectives

    this._uid = uid++

    // a flag to avoid this being observed
    this._isVue = true

    this._events = {}         // registered callbacks
    this._evnetsCount = {}    // for $boardcast optimization

    // fragment instance properties
    this._isFragment = false
    this._fragment =           // @type {DocumentFragment}
    this._fragmentStart =      // @type {Text|Comment}
    this._fragmentEnd = null   // @type {Text|Comment}

    // lifecycle state
    this._isCompiled =
    this._isDestroyed = 
    this._isReady = 
    this._isAttached =
    this._isBeingDestroyed =
    this._vForRemoving = false
    this._unlinkFn = null

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent

    // scope:
    // if this is inside an inline v-for, the scope
    // wille be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to register itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag
    if (this._frag) {
      this._frag.children.push(this)
    }

    // push self into parent / translusion host
    if (this.$parent) {
      this.$parent.$children.push(this)
    }

    // merge options
    options = this.$options = mergeOptions(
      this.constructor.options,
      options,
      this
    )

    // // set ref
    // this._updateRef()

    // initialize data as empty object.
    // it will be filled up in _initData().
    this._data = {}

    // // call init hook
    // this._callHook('init')

    // initialize data observation and scope inheritance.
    this._initState()

    // setup event system and option events.
    this._initEvents()

    // call created hook
    this._callHook('created')

    // if 'el' option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el)
    }
  }
}