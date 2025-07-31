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
      this._setProperty("border-style", v);
    } else {
      const positions = ["top", "right", "bottom", "left"];
      if (/^none$/i.test(v)) {
        v = "";
      }
      this._implicitSetter("border", "style", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("border-style");
  },
  enumerable: true,
  configurable: true
};
