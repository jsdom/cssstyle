"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const val = parsers.parseMeasurement(v, true);
  if (val) {
    return val;
  }
  return parsers.parseKeyword(v);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("padding", "");
      this._setProperty("padding-left", v);
    } else {
      this._subImplicitSetter("padding", "left", v, module.exports.parse, [
        "top",
        "right",
        "bottom",
        "left"
      ]);
    }
  },
  get() {
    return this.getPropertyValue("padding-left");
  },
  enumerable: true,
  configurable: true
};
