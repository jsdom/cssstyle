"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (parsers.isValidPropertyValue("flex-shrink", v)) {
    return parsers.parseNumber(v, true);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("flex", "");
      this._setProperty("flex-shrink", v);
    } else {
      this._setProperty("flex-shrink", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("flex-shrink");
  },
  enumerable: true,
  configurable: true
};
