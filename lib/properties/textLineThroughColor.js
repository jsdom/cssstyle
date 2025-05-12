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
    this._setProperty("text-line-through-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("text-line-through-color");
  },
  enumerable: true,
  configurable: true
};
