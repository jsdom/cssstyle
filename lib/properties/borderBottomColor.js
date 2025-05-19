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
  if (v === "" || typeof parsers.parseKeyword(v) === "string") {
    return true;
  }
  return parsers.isValidColor(v);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("border-bottom-color", parse(v));
  },
  get() {
    return this.getPropertyValue("border-bottom-color");
  },
  enumerable: true,
  configurable: true
};
