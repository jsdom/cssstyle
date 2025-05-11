"use strict";

var isValid = require("./borderWidth").isValid;
module.exports.isValid = isValid;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (isValid(v)) {
      this._setProperty("border-top-width", v);
    }
  },
  get() {
    return this.getPropertyValue("border-top-width");
  },
  enumerable: true,
  configurable: true
};
