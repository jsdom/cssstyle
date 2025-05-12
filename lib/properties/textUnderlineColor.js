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
    this._setProperty("text-underline-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("text-underline-color");
  },
  enumerable: true,
  configurable: true
};
