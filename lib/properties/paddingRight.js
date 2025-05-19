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
  if (v === "") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._subImplicitSetter("padding", "right", v, module.exports.isValid, parse);
  },
  get() {
    return this.getPropertyValue("padding-right");
  },
  enumerable: true,
  configurable: true
};
