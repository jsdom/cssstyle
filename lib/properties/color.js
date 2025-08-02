"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("color", v)) {
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
      this._setProperty("color", v);
    } else {
      this._setProperty("color", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("color");
  },
  enumerable: true,
  configurable: true
};
