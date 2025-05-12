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
    this._setProperty("outline-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("outline-color");
  },
  enumerable: true,
  configurable: true
};
