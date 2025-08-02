"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("border-left-width", v)) {
    const val = parsers.parseLength(v, true);
    if (val) {
      return val;
    }
    return strings.asciiLowercase(v);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-width", "");
      this._setProperty("border-left", "");
      this._setProperty("border-left-width", v);
    } else {
      this._setProperty("border-left-width", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("border-left-width");
  },
  enumerable: true,
  configurable: true
};
