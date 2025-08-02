"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("stop-color", v)) {
    const val = parsers.parseColor(v);
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
      this._setProperty("stop-color", v);
    } else {
      this._setProperty("stop-color", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("stop-color");
  },
  enumerable: true,
  configurable: true
};
