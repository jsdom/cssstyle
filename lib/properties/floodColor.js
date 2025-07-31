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
    if (parsers.hasVarFunc(v)) {
      this._setProperty("flood-color", v);
    } else {
      this._setProperty("flood-color", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("flood-color");
  },
  enumerable: true,
  configurable: true
};
