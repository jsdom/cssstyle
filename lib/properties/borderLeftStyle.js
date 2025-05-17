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
  v = parsers.prepareValue(v);
  if (v === "") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    const val = parse(v);
    if (val === "none" || val === "hidden") {
      this._setProperty("border-left-style", "");
      this._setProperty("border-left-color", "");
      this._setProperty("border-left-width", "");
      return;
    }
    this._setProperty("border-left-style", val);
  },
  get() {
    return this.getPropertyValue("border-left-style");
  },
  enumerable: true,
  configurable: true
};
