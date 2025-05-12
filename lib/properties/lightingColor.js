"use strict";

const parseColor = require("../parsers").parseColor;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("lighting-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("lighting-color");
  },
  enumerable: true,
  configurable: true
};
