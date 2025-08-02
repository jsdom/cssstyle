"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.isValidPropertyValue("border-top-style", v)) {
    return strings.asciiLowercase(v);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-top", "");
      this._setProperty("border-style", "");
      this._setProperty("border-top-style", v);
    } else {
      const val = module.exports.parse(v);
      if (val === "" || val === "none" || val === "hidden") {
        this._setProperty("border-top-style", "");
        this._setProperty("border-top-color", "");
        this._setProperty("border-top-width", "");
      } else {
        this._setProperty("border-top-style", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("border-top-style");
  },
  enumerable: true,
  configurable: true
};
