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
    constructor (ctx, getter, cb) {
      this.ctx = ctx;
      this.getter = getter;
      this.cb = cb;
      this.id = uid$1++;
      this.deps = [];
      this.value = this.get();
    }

    get () {
      Dep.target = this;
      const value = this.getter.call(this.ctx);
      Dep.target = null;
      // this.value = value
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
      const newVal = this.getter.call(this.ctx);
      const oldVal = this.value;
      this.value = newVal;
      this.cb.call(this.ctx, newVal, oldVal);
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

  // 处理参数不定时bind的绑定问题(bind绑定，参数会变成伪数组)
  // 源码中说因为更快，so.. whatever
  function bind (fn, ctx) {
    return function (a) {
      const l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }
  }

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
      const isFn = typeof this.option === 'function';
      const ctx = this.ctx;
      let def$$1 = {
        enumerable: true,
        configurable: true
      };
      if (isFn) {
        def$$1.get = bind(this.option, ctx);
        def$$1.set = noop;
      } else {
        def$$1.set = bind(this.option.set || noop, ctx);
        def$$1.get = bind(this.option.get || noop, ctx);
      }
      Object.defineProperty(ctx, this.key, def$$1);
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
      this.id = uid$4++;
      this.$options = options;
      this._init();
    }

    _init () {
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
      const computeds = this.$options.computed;
      if (!computeds) return
      for (let key in computeds) {
        new Computed(this, key, computeds[key]);
      }
    }
  }

  // let obj = {
  //   msg: 'hello world',
  //   num1: 1,
  //   num2: 2,
  //   obj: {
  //     name: 'test obj'
  //   },
  //   arr: [
  //     1, 2, 3, 4
  //   ]
  // }

  // observe(obj)

  // let watcher1 = new Watcher(obj, function () {
  //   return this.num1 + this.obj.name + this.num2
  // }, function (newVal) {
  //   console.log(`${this.num1} + ${this.obj.name} + ${this.num2} = ${newVal} \n`)
  // })

  // obj.num1 = 11
  // obj.obj.name = 'change name'
  // console.log('----------')

  // let watcher2 = new Watcher(obj, function () {
  //   return this.arr.reduce((sum, num) => sum + num)
  // }, function (newVal) {
  //   console.log(`和为：${newVal}`)
  // })

  // console.log(obj)

  // obj.arr.push(10)
  // obj.arr.pop()
  // obj.arr.unshift(10)
  // obj.arr.shift()
  // obj.arr.splice(0, 1, 10)

  return Vue;

}());
