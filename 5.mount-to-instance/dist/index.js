var Vue = (function () {
  'use strict';

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

  let uid = 0;

  class Watcher {
    constructor (obj, getter, cb) {
      this.obj = obj;
      this.getter = getter;
      this.cb = cb;
      this.deps = [];
      this.id = ++uid;
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

  const isArray = Array.isArray;

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
      if (isArray(value)) {
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
          if (isArray(val)) {
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

  class Vue {
    constructor () {
      Object.assign(this, {
        Dep,
        Watcher,
        observe
      });
    }
  }

  return Vue;

}());
