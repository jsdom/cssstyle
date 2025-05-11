"use strict";

var isValid = require("./borderStyle").isValid;
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
      if (v.toLowerCase() === "none") {
        v = "";
        this.removeProperty("border-left-width");
      }
      this._setProperty("border-left-style", v);
    }
  },
  get() {
    return this.getPropertyValue("border-left-style");
  },
  enumerable: true,
  configurable: true
};
