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
  if (v === "") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("width", parse(v));
  },
  get() {
    return this.getPropertyValue("width");
  },
  enumerable: true,
  configurable: true
};
