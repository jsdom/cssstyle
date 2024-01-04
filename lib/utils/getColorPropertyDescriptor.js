'use strict';

var parseColor = require('../parsers').parseColor;

module.exports = function getColorPropertyDescriptor(name) {
  return {
    set: function (v) {
      this._setProperty(name, parseColor(v));
    },
    get: function () {
      return this.getPropertyValue(name);
    },
    enumerable: true,
    configurable: true,
  };
};
