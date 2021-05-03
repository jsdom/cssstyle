'use strict';

var borderWidth = require('./borderWidth');
var isValid = (module.exports.isValid = borderWidth.isValid);
var parse = borderWidth.parse;

module.exports.definition = {
  set: function(v) {
    if (isValid(v)) {
      this._setProperty('outline-width', parse(v));
    }
  },
  get: function() {
    return this.getPropertyValue('outline-width');
  },
  enumerable: true,
  configurable: true,
};
