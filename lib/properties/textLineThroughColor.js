"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("text-line-through-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("text-line-through-color");
  },
  enumerable: true,
  configurable: true
};
