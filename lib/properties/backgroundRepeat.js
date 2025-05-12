"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === "repeat" ||
      v.toLowerCase() === "repeat-x" ||
      v.toLowerCase() === "repeat-y" ||
      v.toLowerCase() === "no-repeat" ||
      v.toLowerCase() === "inherit")
  ) {
    return v;
  }
  return undefined;
};

module.exports.isValid = function isValid(v) {
  return parse(v) !== undefined;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("background-repeat", parse(v));
  },
  get() {
    return this.getPropertyValue("background-repeat");
  },
  enumerable: true,
  configurable: true
};
