"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const dim = parsers.parseMeasurement(v);
  if (dim) {
    return dim;
  }
  return parsers.parseKeyword(v, ["auto"]);
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
    this._setProperty("left", parse(v));
  },
  get() {
    return this.getPropertyValue("left");
  },
  enumerable: true,
  configurable: true
};
