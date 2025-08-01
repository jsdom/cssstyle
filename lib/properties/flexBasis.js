"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("flex-basis", v)) {
    const val = parsers.parseMeasurement(v);
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
      this._setProperty("flex", "");
      this._setProperty("flex-basis", v);
    } else {
      this._setProperty("flex-basis", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("flex-basis");
  },
  enumerable: true,
  configurable: true
};
