"use strict";

module.exports.isValid = require("./borderColor").isValid;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (module.exports.isValid(v)) {
      this._setProperty("border-left-color", v);
    }
  },
  get() {
    return this.getPropertyValue("border-left-color");
  },
  enumerable: true,
  configurable: true
};
