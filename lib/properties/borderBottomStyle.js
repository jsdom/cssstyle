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
        this.removeProperty("border-bottom-width");
      }
      this._setProperty("border-bottom-style", v);
    }
  },
  get() {
    return this.getPropertyValue("border-bottom-style");
  },
  enumerable: true,
  configurable: true
};
