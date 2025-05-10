"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("outline-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("outline-color");
  },
  enumerable: true,
  configurable: true
};
