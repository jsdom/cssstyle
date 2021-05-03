'use strict';

var isValid = (module.exports.isValid = require('./borderColor').isValid);

module.exports.definition = {
  set: function(v) {
    if (isValid(v)) {
      this._setProperty('outline-color', v);
    }
  },
  get: function() {
    return this.getPropertyValue('outline-color');
  },
  enumerable: true,
  configurable: true,
};
