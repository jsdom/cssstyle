'use strict';

var parse = require('../parsers').parseInheritingMeasurement;

module.exports.definition = {
  set: function (v) {
    this._setProperty('left', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('left');
  },
  enumerable: true,
  configurable: true,
};
