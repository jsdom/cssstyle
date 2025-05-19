"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const keywords = [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset"
  ];
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
    if (v.toLowerCase() === "none") {
      v = "";
    }
    this._implicitSetter("border", "style", v, module.exports.isValid, parse);
  },
  get() {
    return this.getPropertyValue("border-style");
  },
  enumerable: true,
  configurable: true
};
