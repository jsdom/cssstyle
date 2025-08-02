"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("border-right-width", v)) {
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
      this._setProperty("border-right", "");
      this._setProperty("border-right-width", v);
    } else {
      this._setProperty("border-right-width", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("border-right-width");
  },
  enumerable: true,
  configurable: true
};
