"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const val = parsers.parseColor(v);
  if (val) {
    return val;
  }
  return parsers.parseKeyword(v);
};

module.exports.isValid = function isValid(v) {
  v = parsers.prepareValue(v);
  if (v === "" || typeof parsers.parseKeyword(v) === "string") {
    return true;
  }
  return parsers.isValidColor(v);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._setProperty("color", parse(v));
  },
  get() {
    return this.getPropertyValue("color");
  },
  enumerable: true,
  configurable: true
};
