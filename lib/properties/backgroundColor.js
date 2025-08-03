"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("background-color", v)) {
    const val = parsers.parseColor(v);
    if (val) {
      return val;
    }
    return parsers.parseKeyword(v);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("background", "");
      this._setProperty("background-color", v);
    } else {
      this._setProperty("background-color", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-color");
  },
  enumerable: true,
  configurable: true
};
