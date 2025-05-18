"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const dim = parsers.parseMeasurement(v, true);
  if (dim) {
    return dim;
  }
  const keywords = ["auto", "min-content", "max-content", "fit-content"];
  return parsers.parseKeyword(v, keywords);
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
    this._setProperty("height", parse(v));
  },
  get() {
    return this.getPropertyValue("height");
  },
  enumerable: true,
  configurable: true
};
