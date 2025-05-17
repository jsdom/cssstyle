"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const num = parsers.parseNumber(v, true);
  if (num && parseFloat(num) <= 1000) {
    return num;
  }
  const keywords = ["normal", "none", "small-caps"];
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
    this._setProperty("font-variant", parse(v));
  },
  get() {
    return this.getPropertyValue("font-variant");
  },
  enumerable: true,
  configurable: true
};
