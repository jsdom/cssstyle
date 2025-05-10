"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("-webkit-border-before-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-border-before-color");
  },
  enumerable: true,
  configurable: true
};
