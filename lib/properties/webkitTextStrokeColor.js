"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("-webkit-text-stroke-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-text-stroke-color");
  },
  enumerable: true,
  configurable: true
};
