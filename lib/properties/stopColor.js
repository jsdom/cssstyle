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
    this._setProperty("stop-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("stop-color");
  },
  enumerable: true,
  configurable: true
};
