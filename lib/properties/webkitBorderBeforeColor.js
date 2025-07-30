"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const val = parsers.parseColor(v);
  if (val) {
    return val;
  }
  return parsers.parseKeyword(v);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("-webkit-border-before-color", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("-webkit-border-before-color");
  },
  enumerable: true,
  configurable: true
};
