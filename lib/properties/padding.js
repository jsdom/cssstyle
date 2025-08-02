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
  if (parsers.isValidPropertyValue("padding", v)) {
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
      this._implicitSetter("padding", "", "", module.exports.parse, positions);
      this._setProperty("padding", v);
    } else {
      this._implicitSetter("padding", "", v, module.exports.parse, positions);
    }
  },
  get() {
    const val = this._implicitGetter("padding", positions);
    if (val === "") {
      return this.getPropertyValue("padding");
    }
    if (parsers.hasVarFunc(val)) {
      return "";
    }
    return val;
  },
  enumerable: true,
  configurable: true
};
