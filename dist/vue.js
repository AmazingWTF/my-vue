'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var util = createCommonjsModule(function (module, exports) {
  /**
   * Mix properties into target object
   * 
   * @param {target} object 
   * @param {mixin} object 
   */

  exports.mixin = function (target, mixin) {
    for (var key in mixin) {
      if (target[key] !== mixin[key]) {
        target[key] = mixin[key];
      }
    }
  };

  /**
   * Object type check. Only returns true 
   * for plain Javascript objects.
   * 
   * @param {*} obj
   * @return {Boolean}
   */
  exports.isObject = function (obj) {
    return Object.toString.call(obj) === '[object Object]';
  };

  /**
   * Array type check
   * 
   * @param {*} obj 
   * @return {Boolean}
   */
  exports.isArray = function (obj) {
    return Array.isArray.call(obj);
  };

  exports.define = function (obj, key, val) {
    Object.definePropertiey(obj, key, {
      value: val,
      enumerable: false,
      writable: true,
      configurable: true
    });
  };

  /**
   * Augment an Object or Array by either
   * intercepting the prototype chain using __proto__,
   * or copy over property descriptors
   * 
   * 重写对象的 __proto__ 属性或使用对象原生的直接方法定义在对象身上，
   * 来扩展一个对象或数组，拦截本来的原型链
   * 
   * @param {Object|Array} target
   * @param {Object} proto
   */

  if ('__proto__' in {}) {
    exports.augment = function (target, proto) {
      target.__proto__ = proto;
    };
  } else {
    exports.augment = function (target, proto) {
      Object.getOwnPropertyNames(proto).forEach(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(proto, key);
        Object.defineProperty(target, key, descriptor);
      });
    };
  }
});
var util_1 = util.mixin;
var util_2 = util.isObject;
var util_3 = util.isArray;
var util_4 = util.define;
var util_5 = util.augment;

function Compiler() {}

var compiler = Compiler;



var lifecycle = /*#__PURE__*/Object.freeze({

});



var data = /*#__PURE__*/Object.freeze({

});



var dom = /*#__PURE__*/Object.freeze({

});



var events = /*#__PURE__*/Object.freeze({

});



var apiAssetRegister = /*#__PURE__*/Object.freeze({

});



var config = /*#__PURE__*/Object.freeze({

});



var require = /*#__PURE__*/Object.freeze({

});



var use = /*#__PURE__*/Object.freeze({

});



var extend = /*#__PURE__*/Object.freeze({

});

/**
 * the exposed Vue constructor
 * 
 * @constructor
 * @public
 */

function Vue(options) {
  this._compiler = new compiler(this, options);
}

// mixin instance methods
var p = Vue.prototype;
util.mixin(p, lifecycle);
util.mixin(p, data);
util.mixin(p, dom);
util.mixin(p, events);

// mixin asset registers
util.mixin(Vue, apiAssetRegister);

// static methods
// 实例本身的方法，因为 module.exports 只会导出 Vue 构造函数，原型对象的方法在外界无法访问，所以原型中放的都是私有方法，不向外暴露
Vue.config = config;
Vue.require = require;
Vue.use = use;
Vue.extend = extend;
Vue.nextTick = util.nextTick;

var vue = Vue;

module.exports = vue;
