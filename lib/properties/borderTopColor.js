"use strict";

var isValid = (module.exports.isValid = require("./borderColor").isValid);

module.exports.definition = {
  set(v) {
    if (isValid(v)) {
      this._setProperty("border-top-color", v);
    }
  },
  get() {
    return this.getPropertyValue("border-top-color");
  },
  enumerable: true,
  configurable: true
};
