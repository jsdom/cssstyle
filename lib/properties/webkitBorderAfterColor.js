"use strict";

var parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("-webkit-border-after-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-border-after-color");
  },
  enumerable: true,
  configurable: true
};
