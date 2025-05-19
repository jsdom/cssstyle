"use strict";

const parsers = require("../parsers");

function parse(v) {
  const val = parsers.parseMeasurement(v);
  if (val) {
    return val;
  }
  const keywords = ["content", "auto", "min-content", "max-content"];
  return parsers.parseKeyword(v, keywords);
}

module.exports.isValid = function isValid(v) {
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("flex-basis", parse(v));
  },
  get() {
    return this.getPropertyValue("flex-basis");
  },
  enumerable: true,
  configurable: true
};
