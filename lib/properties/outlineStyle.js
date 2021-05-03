'use strict';

var isValid = (module.exports.isValid = require('./borderStyle').isValid);

module.exports.definition = {
  set: function(v) {
    if (isValid(v)) {
      if (v.toLowerCase() === 'none') {
        v = '';
        this.removeProperty('outline-style');
      }
      this._setProperty('outline-style', v);
    }
  },
  get: function() {
    return this.getPropertyValue('outline-style');
  },
  enumerable: true,
  configurable: true,
};
