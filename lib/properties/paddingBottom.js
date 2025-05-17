"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const val = parsers.parseMeasurement(v, true);
  if (val) {
    return val;
  }
  return parsers.parseKeyword(v);
};

module.exports.isValid = function isValid(v) {
  v = parsers.prepareValue(v);
  if (v === "") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._subImplicitSetter("padding", "bottom", v, module.exports.isValid, parse);
  },
  get() {
    return this.getPropertyValue("padding-bottom");
  },
  enumerable: true,
  configurable: true
};
