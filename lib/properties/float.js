"use strict";

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("float", v);
  },
  get() {
    return this.getPropertyValue("float");
  },
  enumerable: true,
  configurable: true
};
