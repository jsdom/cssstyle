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
    this._setProperty("text-overline-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("text-overline-color");
  },
  enumerable: true,
  configurable: true
};
