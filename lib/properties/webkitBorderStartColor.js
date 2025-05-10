"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    this._setProperty("-webkit-border-start-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-border-start-color");
  },
  enumerable: true,
  configurable: true
};
