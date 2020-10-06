'use strict';

var parse = require('../parsers').parseInheritingMeasurement;

module.exports.definition = {
  set: function(v) {
    this._setProperty('top', parse(v));
  },
  get: function() {
    return this.getPropertyValue('top');
  },
  enumerable: true,
  configurable: true,
};
