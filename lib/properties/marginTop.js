"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

const positions = ["top", "right", "bottom", "left"];

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("margin-top", v)) {
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
      this._setProperty("margin", "");
      this._setProperty("margin-top", v);
    } else {
      this._subImplicitSetter("margin", "top", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("margin-top");
  },
  enumerable: true,
  configurable: true
};
