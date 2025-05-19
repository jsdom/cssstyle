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
    const val = parse(v);
    if (val === "none" || val === "hidden") {
      this._setProperty("border-bottom-style", "");
      this._setProperty("border-bottom-color", "");
      this._setProperty("border-bottom-width", "");
      return;
    }
    this._setProperty("border-bottom-style", val);
  },
  get() {
    return this.getPropertyValue("border-bottom-style");
  },
  enumerable: true,
  configurable: true
};
