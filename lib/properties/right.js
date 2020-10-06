'use strict';

var parse = require('../parsers').parseInheritingMeasurement;

module.exports.definition = {
  set: function(v) {
    this._setProperty('right', parse(v));
  },
  get: function() {
    return this.getPropertyValue('right');
  },
  enumerable: true,
  configurable: true,
};
