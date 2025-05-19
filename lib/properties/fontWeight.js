"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const num = parsers.parseNumber(v, true);
  if (num && parseFloat(num) <= 1000) {
    return num;
  }
  const keywords = ["normal", "bold", "lighter", "bolder"];
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
    this._setProperty("font-weight", parse(v));
  },
  get() {
    return this.getPropertyValue("font-weight");
  },
  enumerable: true,
  configurable: true
};
