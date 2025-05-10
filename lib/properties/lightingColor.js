"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("lighting-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("lighting-color");
  },
  enumerable: true,
  configurable: true
};
