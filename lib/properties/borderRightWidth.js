"use strict";

var isValid = (module.exports.isValid = require("./borderWidth").isValid);

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (isValid(v)) {
      this._setProperty("border-right-width", v);
    }
  },
  get() {
    return this.getPropertyValue("border-right-width");
  },
  enumerable: true,
  configurable: true
};
