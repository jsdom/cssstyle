"use strict";

module.exports.isValid = require("./borderStyle").isValid;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (module.exports.isValid(v)) {
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
