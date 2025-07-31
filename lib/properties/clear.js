"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const keywords = [
    "inline-start",
    "inline-end",
    "block-start",
    "block-end",
    "left",
    "right",
    "top",
    "bottom",
    "both-inline",
    "both-block",
    "both",
    "none"
  ];
  return parsers.parseKeyword(v, keywords);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("clear", v);
    } else {
      this._setProperty("clear", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("clear");
  },
  enumerable: true,
  configurable: true
};
