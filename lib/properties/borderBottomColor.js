"use strict";

var isValid = (module.exports.isValid = require("./borderColor").isValid);

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (isValid(v)) {
      this._setProperty("border-bottom-color", v);
    }
  },
  get() {
    return this.getPropertyValue("border-bottom-color");
  },
  enumerable: true,
  configurable: true
};
