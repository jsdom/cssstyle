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
      this._setProperty("border-bottom-width", v);
    }
  },
  get() {
    return this.getPropertyValue("border-bottom-width");
  },
  enumerable: true,
  configurable: true
};
