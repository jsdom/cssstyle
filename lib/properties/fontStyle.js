"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const keywords = ["normal", "italic", "oblique"];
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
    this._setProperty("font-style", parse(v));
  },
  get() {
    return this.getPropertyValue("font-style");
  },
  enumerable: true,
  configurable: true
};
