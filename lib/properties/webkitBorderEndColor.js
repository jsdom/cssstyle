"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("-webkit-border-end-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-border-end-color");
  },
  enumerable: true,
  configurable: true
};
