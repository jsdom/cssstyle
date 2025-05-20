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

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("line-height", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("line-height");
  },
  enumerable: true,
  configurable: true
};
