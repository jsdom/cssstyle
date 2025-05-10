"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("-webkit-tap-highlight-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-tap-highlight-color");
  },
  enumerable: true,
  configurable: true
};
