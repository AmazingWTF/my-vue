var _ = require('../util')
var config = require('../config')

/**
 * Configuration
 */

exports.config = function () {

}

/**
 * Class inheritance
 */

exports.extend = function () {

}

/**
 * Plugin system
 */

exports.use = function () {

}

/**
 * Expose some internal utilities
 */

exports.require = function () {

}

config.assetTypes.forEach(function (type) {
  var registry = '_' + type + 's'
  exports[registry] = {}

  exports[type] = function (id, definition) {
    this[registry][id] = definition
  }
})

exports.nextTick = _.nextTick