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
  if (parsers.isValidPropertyValue("padding-right", v)) {
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
      this._setProperty("padding", "");
      this._setProperty("padding-right", v);
    } else {
      this._subImplicitSetter("padding", "right", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("padding-right");
  },
  enumerable: true,
  configurable: true
};
