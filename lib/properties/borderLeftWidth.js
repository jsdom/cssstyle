"use strict";

module.exports.isValid = require("./borderWidth").isValid;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (module.exports.isValid(v)) {
      this._setProperty("border-left-width", v);
    }
  },
  get() {
    return this.getPropertyValue("border-left-width");
  },
  enumerable: true,
  configurable: true
};
