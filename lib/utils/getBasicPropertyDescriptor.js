"use strict";

module.exports = function getBasicPropertyDescriptor(name) {
  return {
    set(v) {
      this._setProperty(name, v);
    },
    get() {
      return this.getPropertyValue(name);
    },
    enumerable: true,
    configurable: true
  };
};
