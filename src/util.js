// common utils

// need deep copy?
exports.mixin = function (target, mixin) {
  for (var key in mixin) {
    if (target[key] !== mixin[key]) {
      target[key] = mixin[key]
    }
  }
}

exports.nextTick = function () {
  
}