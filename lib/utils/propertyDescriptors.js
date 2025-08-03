"use strict";

const parsers = require("../parsers");

module.exports.getPropertyDescriptor = function getPropertyDescriptor(property) {
  return {
    set(v) {
      v = parsers.parsePropertyValue(property, v, this._global);
      this._setProperty(property, v);
    },
    get() {
      return this.getPropertyValue(property);
    },
    enumerable: true,
    configurable: true
  };
};
