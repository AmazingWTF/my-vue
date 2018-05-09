var Vue = (function () {
  'use strict';

  // 事件处理

  let uid = 0;

  class Event {
    constructor() {
      this.id = ++uid;
      this._events = {};
    }

    $on(eventName, fn) {
      let object = this;
      if (Array.isArray(eventName)) {                               // 处理事件名是数组的情况
        eventName.forEach(name => this.$on(name, fn));
      } else {
        if (!Array.isArray(fn)) {                                 // 处理处理函数为数组的情况
          fn = [fn];
        }
        // 若 _events 对象下无对应事件名，则新建一个数组，然后将处理函数推入数组
        (object._events[eventName] || (object._events[eventName] = [])).push(...fn);
      }
      return object
    }

    $once(eventName, fn) {
      let object = this;

      function on() {
        // 先取消，然后触发，确保仅一次
        object.$off(eventName, on);
        fn.apply(object, arguments);
      }

      on.fn = fn;
      object.$on(eventName, on);
      return object
    }

    $off(eventName, fn) {
      let object = this;
      // 清空所有事件
      if (!arguments.length) {
        object._events = Object.create(null);
        return object
      }
      // 清空多个事件
      if (Array.isArray(eventName)) {
        eventName.forEach(name => this.$off(name, fn));
        return object
      }
      // 若没有事件对应的函数列表则不用处理
      let cbs = object._events[eventName];
      if (!cbs) {
        return object
      }
      // 清空特定事件
      if (!fn) {
        object._events[eventName] = null;
        return object
      }
      // 取消特定事件的特定处理函数
      if (fn) {
        let cb;
        let i = cbs.length;
        // 处理一次取消多个的情况
        if (Array.isArray(fn)) {
          fn.forEach(fnc => this.$off(eventName, fnc));
          return
        }
        while (i--) {
          console.log(i);
          cb = cbs[i];
          if (cb === fn || cb.fn === fn) {
            cbs.splice(i, 1);
            break
          }
        }
      }
      return object
    }

    $emit(eventName, ...args) {
      let object = this;
      let cbs = object._events[eventName];
      if (cbs) {
        cbs.forEach(func => func.apply(object, args));
      }
      return object
    }

  }

  /**
   * 将target的属性对象中的成员代理到target上面
   * 
   * @param {Obejct} target - 目标对象
   * @param {String} sourceKey - 来源目标的键名
   * @param {String} key - 目标方法的键名
   */

  function proxy (target, src) {
    for (let k in src) {
      Object.defineProperty(target, k, {
        enumerable: true,
        configurable: true,
        get () {
          return src[k]
        },
        set (newVal) {
          src[k] = newVal;
        }
      });
    }
  }

  class Dep {
    constructor () {
      this.subs = [];
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
      this.subs.forEach(sub => sub.update());
    }
  }
  Dep.target = null;

  const isArray$1 = Array.isArray;

  function protoAugment (target, src, keys) {
    target.__proto__ = src;
  }

  function copyAugment (target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      Object.defineProperty(target, key, {
        value: src[key],
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
  }

  // 实现对对象的属性拦截

  let arrayProto = Array.prototype;
  let arrayKeys = [
    'push',
    'unshift',
    'shift',
    'pop',
    'splice',
    'reverse',
    'sort'
  ];

  const arrayMethods = Object.create(arrayProto);
  arrayMethods.forEach(method => {
    let mutator = function (...args) {
      let original = arrayMethods[method];
      const result = original.apply(this, args);
      let sorted;
      switch (method) {
        case 'push':
        case 'unshift':
          sorted = args;
          break
        case 'splice':
          sorted = args.slice(2);
          break
      }
      
    };

    Object.defineProperty(arrayMethods, method, {
      value: mutator,
      configurable: true,
      enumerable: false,
      writable: true
    });
  });


  class Observer {
    constructor (value) {
      this.value = value;
      if (isArray$1(value)) {
        // 数组依赖处理
        this.dep = new Dep();
        const augment = ('__proto__' in {}) ? protoAugment : copyAugment;
        augment(value, arrayMethods, arrayKeys);
        this.observeArray(value);
      } else {
        this.walk(value);
      }

      Object.defineProperty(value, '__ob__', {
        value: this,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    walk (obj) {
      const keys = Object.keys(obj);
      for (let i = 0, l = keys.length; i < l; i++) {
        defineReactive(obj, keys[i], obj[keys[i]]);
      }
    }
    observeArray (items) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
      }
    }
  }

  function observe (value) {
    if (typeof value !== 'object') {
      return
    }
    let ob;
    if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else {
      if (Object.isExtensible(value)) {
        ob = new Observer(value);
      }
    }
    return ob
  }

  function defineReactive (obj, key, val) {
    let dep = new Dep();
    let childOb = observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        if (Dep.target) {
          dep.addSub(Dep.target);
          Dep.target.addDep(dep);
          if (isArray$1(val)) {
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

  let uid$1 = 0;

  class Watcher {
    constructor (obj, getter, cb) {
      this.obj = obj;
      this.getter = getter;
      this.cb = cb;
      this.deps = [];
      this.id = ++uid$1;
      this.value = this.get();
    }

    get () {
      Dep.target = this;
      const value = this.getter.call(this.obj);
      Dep.target = null;
      return value
    }
    addDep (dep) {
      this.deps.push(dep);
    }
    update () {
      const newValue = this.getter.call(this.obj);
      const oldValue = this.value;
      this.value = newValue;
      this.cb.call(this.obj, newValue, oldValue);
    }
    // 清除当前watcher
    teardown () {
      this.deps.forEach(dep => dep.removeSub(this));
      this.deps = [];
    }
  }

  class Vue extends Event {
    constructor (options) {
      super();
      this._init(options);
    }

    _init (options) {
      let vm = this;
      // 代理data
      vm._data = options.data.call(vm);
      proxy(vm, vm._data);
      // 代理methods
      const methods = options.methods;
      if (methods) {
        for (let k in methods) {
          vm[k] = methods[k].bind(vm);
        }
      }
      observe(vm._data);

      // watch 处理
      // 此处需要填充别的内容，暂为测试可用
      const watches = options.watch;
        for (let k in watches) {
          new Watcher(vm, function () {
            return k.split('.').reduce((obj, key) => obj[key], vm)
          }, watches[k]);
        }
    }

  }

  return Vue;

}());
