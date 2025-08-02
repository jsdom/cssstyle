"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.isValidPropertyValue("border-right-style", v)) {
    return strings.asciiLowercase(v);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-right", "");
      this._setProperty("border-style", "");
      this._setProperty("border-right-style", v);
    } else {
      const val = module.exports.parse(v);
      if (val === "" || val === "none" || val === "hidden") {
        this._setProperty("border-right-style", "");
        this._setProperty("border-right-color", "");
        this._setProperty("border-right-width", "");
      } else {
        this._setProperty("border-right-style", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("border-right-style");
  },
  enumerable: true,
  configurable: true
};
