"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const val = parsers.parseKeyword(v, ["normal"]);
  if (val) {
    return val;
  }
  const num = parsers.parseNumber(v, true);
  if (num) {
    return num;
  }
  return parsers.parseMeasurement(v, true);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("font", "");
      this._setProperty("line-height", v);
    } else {
      this._setProperty("line-height", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("line-height");
  },
  enumerable: true,
  configurable: true
};
