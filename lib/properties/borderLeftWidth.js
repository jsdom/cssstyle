"use strict";

var isValid = (module.exports.isValid = require("./borderWidth").isValid);

module.exports.definition = {
  set(v) {
    if (isValid(v)) {
      this._setProperty("border-left-width", v);
    }
  },
  get() {
    return this.getPropertyValue("border-left-width");
  },
  enumerable: true,
  configurable: true
};
