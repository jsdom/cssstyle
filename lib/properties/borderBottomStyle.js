"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
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

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-bottom", "");
      this._setProperty("border-style", "");
      this._setProperty("border-bottom-style", v);
    } else {
      const val = module.exports.parse(v);
      if (val === "" || val === "none" || val === "hidden") {
        this._setProperty("border-bottom-style", "");
        this._setProperty("border-bottom-color", "");
        this._setProperty("border-bottom-width", "");
      } else {
        this._setProperty("border-bottom-style", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("border-bottom-style");
  },
  enumerable: true,
  configurable: true
};
