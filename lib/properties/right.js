"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("right", v)) {
    const dim = parsers.parseMeasurement(v);
    if (dim) {
      return dim;
    }
    return strings.asciiLowercase(v);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("right", v);
    } else {
      this._setProperty("right", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("right");
  },
  enumerable: true,
  configurable: true
};
