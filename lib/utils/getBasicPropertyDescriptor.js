'use strict';

const { toDOMString } = require('../parsers');

module.exports = function getBasicPropertyDescriptor(name) {
  return {
    set: function(v) {
      this._setProperty(name, toDOMString(v));
    },
    get: function() {
      return this.getPropertyValue(name);
    },
    enumerable: true,
    configurable: true,
  };
};
