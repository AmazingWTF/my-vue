var Vue = (function () {
  'use strict';

  let uid = 0;

  class Dep {
    constructor () {
      this.subs = [];
      this.id = uid++;
    }

    addSub (sub) {
      this.subs.push(sub);
    }
    removeSub (sub) {
      const index = this.subs.indexOf(sub);
      if (index > -1) {
        this.subs.splice(index, 1);
      }
    }
    notify () {
      this.subs && this.subs.forEach(sub => sub.update());
    }

  }
  Dep.target = null;

  let uid$1 = 0;

  class Watcher {
    constructor (ctx, getter, cb, options) {
      this.ctx = ctx;
      this.getter = getter;
      this.cb = cb;
      this.id = uid$1++;
      this.deps = [];
      this.value = this.get();
      if (options) {
        this.lazy = !!options.lazy;
      } else {
        this.lazy = false;
      }
      this.dirty = this.lazy;
    }

    get () {
      Dep.target = this;
      const value = this.getter.call(this.ctx);
      Dep.target = null;
      return value
    }
    addDep (dep) {
      this.deps.push(dep);
    }
    teardown () {
      this.deps.forEach(dep => dep.removeSub(this));
      this.deps = [];
    }
    update () {
      if (this.lazy) {
        this.dirty = true;
        return
      }
      const newVal = this.getter.call(this.ctx);
      const oldVal = this.value;
      this.value = newVal;
      this.cb.call(this.ctx, newVal, oldVal);
    }
    evaluate () {
      this.value = this.getter.call(this.ctx);
      this.dirty = false;
    }
  }

  // 拦截数组方法，进行依赖收集

  const arrayProto = Array.prototype;
  let arrayMethods = Object.create(arrayProto)

  ;[
    'push',
    'unshift',
    'pop',
    'shift',
    'splice',
    'sort',
    'reverse'
  ]
  .forEach(method => {
    let mutator = function (...args) {
      const original = arrayProto[method];
      const result = original.apply(this, args);
      let inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      this.__ob__.dep.notify();
      // return result
    };

    Object.defineProperty(arrayMethods, method, {
      value: mutator,
      enumerable: true,
      configurable: true,
      writable: true
    });
  });

  function isFn (value) {
    return typeof value === 'function'
  }

  const mergeOptions = function (parent, child) {
    // data methods computed watch
    let options = {};
    // 合并data 同名覆盖
    options.data = mergeData(parent.data, child.data);
    // 合并methods 同名覆盖
    options.methods = merge(parent.methods, child.methods);
    //合并computed 同名覆盖
    options.computed = merge(parent.computed, child.computed);
    // 合并watch 同名合并成为数组
    options.watch = mergeWatch(parent.watch, child.watch);

    return options
  };

  function merge (parent, child) {
    if (!parent) return child
    if (!child) return parent
    return Object.assign(parent, child)
  }

  // return一个函数(因为data必须是个函数)
  function mergeData (parent, child) {
    if (!parent) return child
    if (!child) return parent
    return function mergeFnc () {
      return Object.assign(isFn(parent) ? parent.call(this) : parent, isFn(child) ? child.call(this) : child)
    }
  }

  function mergeWatch (parent, child) {
    if (!child) return Object.create(parent || {})
    let res = Object.assign({}, parent);
    for (let k in child) {
      let p = res[k];
      let c = child[k];
      if (p && !Array.isArray(p)) {
        p = [p];
      }
      res[k] = p
        ? p.concat(c)
        : Array.isArray(c) ? c : [c];
    }
    return res
  }

  const isArray = Array.isArray;

  const noop = function () {};

  const def = function (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  };

  let uid$2 = 0;

  class Observer {
    constructor (value) {
      this.value = value;
      this.id = uid$2++;
      if (isArray(value)) {
        this.dep = new Dep();
        let augment = ('__proto__' in {})
          ? protoAugment
          : copyAugment;
        augment(value, arrayMethods);
        this.observeArray(value);
      } else {
        this.walk(value);
      }

      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }

    walk (obj) {
      const keys = Object.keys(obj);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        defineReactive(obj, key, obj[key]);
      }
    }

    observeArray (items) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
      }
    }
  }

  function protoAugment (target, src) {
    target.__proto__ = src;
  }

  function copyAugment (target, src) {
    for (let k in src) {
      def(target, k, src[k]);
    }
  }

  function observe (value) {
    if (typeof value !== 'object') return
    let ob;
    if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else {
      ob = new Observer(value);
    }
    return ob
  }

  function defineReactive (obj, key, val) {
    let dep = new Dep();
    // 将属性值observe，如果是复杂类型，返回一个Observer实例
    let childOb = observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        if (Dep.target) {
          dep.addSub(Dep.target);
          Dep.target.addDep(dep);
          if (isArray(val)) {
            // key的值是数组，所以数组
            childOb.dep.addSub(Dep.target);
            Dep.target.addDep(childOb.dep);
          }
        }
        return val
      },
      set (newVal) {
        if (newVal !== val) {
          val = newVal;
          dep.notify();
        }
      }
    });
  }

  class Computed {
    constructor (ctx, key, option) {
      this.ctx = ctx;
      this.key = key;
      this.option = option;

      this._init();
    }

    _init () {
      let getter = noop;
      this._watch = [];
      if (typeof this.option === 'function') {
        getter = this.option;
      } else {
        getter = this.option.get;
      }
      let watcher = new Watcher(
        this.ctx,
        getter || noop,
        noop,
        { lazy: true }
      );
      this._watch.push(watcher);
      Object.defineProperty(this.ctx, this.key, {
        enumerable: true,
        configurable: true,
        set: this.option.set || noop,
        get () {
          if (watcher.dirty) {
            watcher.evaluate();
          }
          return watcher.value
        }
      });
    }
  }

  let uid$3 = 0;

  class Event {
    constructor () {
      this.id = uid$3++;
      this._events = [];
    }

    $on (eventName, fn) {
      if (isArray(eventName)) {
        eventName.forEach(name => this.$on(name, fn));
        return
      }
      else if (isArray(fn)) {
        fn.forEach(fnc => this.$on(eventName, fnc));
        return
      }
      (this._events[eventName] || (this._events[eventName] = [])).push(fn);
      return this
    }
    $once (eventName, fn) {
      let self = this;
      function on () {
        self.$off(eventName, on);
        fn.apply(self, arguments);
      }
      on.fn = fn;
      self.$on(eventName, on);
      return self
    }
    $off (eventName, fn) {
      if (!arguments.length) {
        return this
      }
      if (isArray(eventName)) {
        eventName.forEach(name => this.$off(name, fn));
        return this
      }
      const cbs = this._events[eventName];
      if (!cbs) return
      if (!fn) {
        this._events[eventName] = null;
        return this
      } else {
        if (!isArray(fn)) {
          fn = [fn];
        }
        fn.forEach(fnc => {
          for (let i = 0, l = cbs.length; i < l; i++) {
            const cb = cbs[i];
            if (cb === fnc || cb.fn === fnc) {
              cbs.splice(i, 1);
              break
            }
          }
        });
      }
    }

    $emit (eventName, ...args) {
      let cbs = this._events[eventName];
      cbs && cbs.forEach(fn => fn.apply(null, args));
    }
  }

  let uid$4 = 0;

  class Vue extends Event {
    constructor (options) {
      super();
      this._init(options);
    }
    
    _init (options) {
      let vm = this;
      vm.id = uid$4++;
      vm.$options = mergeOptions(
        vm.constructor.options,
        options,
        vm
      );
      this._initData();
      this._initWatch();
      this._initComputed();
    }

    _initData () {
      let _data = this.$options.data;
      observe(_data);
      for (let k in _data) {
        Object.defineProperty(this, k, {
          enumerable: true,
          configurable: true,
          get () {
            return _data[k]
          },
          set (newVal) {
            _data[k] = newVal;
          }
        });
      }
    }

    _initWatch () {
      this._watch = [];
      const watch = this.$options.watch;
      if (!watch) return
      for (let key in watch) {
        const keys = key.split('.');
        let watcher = new Watcher(this, function () {
          return keys.reduce((r, k) => r[k], this)
        }, watch[key]);
        this._watch.push(watcher);
      }
    }

    _initComputed () {
      this._comupted = [];
      const computeds = this.$options.computed;
      if (!computeds) return
      for (let key in computeds) {
        this._comupted.push(new Computed(this, key, computeds[key]));
      }
    }
  }

  Vue.options = {
    components: {},
    _base: Vue
  };

  Vue.extend = function (extendOptions) {
    const Super = this;
    
    class Sub extends Super {
      constructor (options) {
        super(options);
      }
    }

    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );

    Sub.super = Super;
    Sub.extend = Super.extend;

    return Sub
  };

  return Vue;

}());
