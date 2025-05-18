"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const keywords = ["thin", "medium", "thick"];
  const key = parsers.parseKeyword(v, keywords);
  if (key) {
    return key;
  }
  return parsers.parseLength(v, true);
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
    this._setProperty("border-left-width", parse(v));
  },
  get() {
    return this.getPropertyValue("border-left-width");
  },
  enumerable: true,
  configurable: true
};
