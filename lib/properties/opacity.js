"use strict";

const parseNumber = require("../parsers").parseNumber;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("opacity", parseNumber(v));
  },
  get() {
    return this.getPropertyValue("opacity");
  },
  enumerable: true,
  configurable: true
};
