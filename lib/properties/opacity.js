"use strict";

var parseNumber = require("../parsers").parseNumber;

module.exports.definition = {
  set(v) {
    this._setProperty("opacity", parseNumber(v));
  },
  get() {
    return this.getPropertyValue("opacity");
  },
  enumerable: true,
  configurable: true
};
