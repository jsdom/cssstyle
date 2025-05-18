"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  return parsers.parseNumber(v, true);
};

module.exports.isValid = function isValid(v) {
  v = parsers.prepareValue(v);
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._setProperty("flex-grow", parse(v));
  },
  get() {
    return this.getPropertyValue("flex-grow");
  },
  enumerable: true,
  configurable: true
};
