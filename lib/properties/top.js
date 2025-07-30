"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const dim = parsers.parseMeasurement(v);
  if (dim) {
    return dim;
  }
  return parsers.parseKeyword(v, ["auto"]);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("top", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("top");
  },
  enumerable: true,
  configurable: true
};
