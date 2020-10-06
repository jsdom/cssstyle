'use strict';

var parse = require('../parsers').parseInheritingMeasurement;

module.exports.definition = {
  set: function(v) {
    this._setProperty('bottom', parse(v));
  },
  get: function() {
    return this.getPropertyValue('bottom');
  },
  enumerable: true,
  configurable: true,
};
