"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("text-overline-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("text-overline-color");
  },
  enumerable: true,
  configurable: true
};
