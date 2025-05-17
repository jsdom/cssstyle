"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const keywords = ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round"];
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
    this._setProperty("background-repeat", parse(v));
  },
  get() {
    return this.getPropertyValue("background-repeat");
  },
  enumerable: true,
  configurable: true
};
