"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const keywords = ["fixed", "scroll", "local"];
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
    this._setProperty("background-attachment", parse(v));
  },
  get() {
    return this.getPropertyValue("background-attachment");
  },
  enumerable: true,
  configurable: true
};
