"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const dim = parsers.parseMeasurement(v, true);
  if (dim) {
    return dim;
  }
  const keywords = ["auto", "min-content", "max-content", "fit-content"];
  return parsers.parseKeyword(v, keywords);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("width", v);
    } else {
      this._setProperty("width", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("width");
  },
  enumerable: true,
  configurable: true
};
