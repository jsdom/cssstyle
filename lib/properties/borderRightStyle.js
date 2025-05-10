"use strict";

var isValid = require("./borderStyle").isValid;
module.exports.isValid = isValid;

module.exports.definition = {
  set(v) {
    if (isValid(v)) {
      if (v.toLowerCase() === "none") {
        v = "";
        this.removeProperty("border-right-width");
      }
      this._setProperty("border-right-style", v);
    }
  },
  get() {
    return this.getPropertyValue("border-right-style");
  },
  enumerable: true,
  configurable: true
};
