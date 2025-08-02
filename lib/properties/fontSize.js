"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("font-size", v)) {
    const val = parsers.parseMeasurement(v, true);
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
      this._setProperty("font", "");
      this._setProperty("font-size", v);
    } else {
      this._setProperty("font-size", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("font-size");
  },
  enumerable: true,
  configurable: true
};
