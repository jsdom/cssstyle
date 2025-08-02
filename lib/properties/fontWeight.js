"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("font-weight", v)) {
    const val = parsers.parseNumber(v, true);
    if (val) {
      if (val < 1 || parseFloat(val) > 1000) {
        return;
      }
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
      this._setProperty("font-weight", v);
    } else {
      this._setProperty("font-weight", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("font-weight");
  },
  enumerable: true,
  configurable: true
};
