"use strict";

module.exports.definition = {
  set(v) {
    this._setProperty("float", v);
  },
  get() {
    return this.getPropertyValue("float");
  },
  enumerable: true,
  configurable: true
};
