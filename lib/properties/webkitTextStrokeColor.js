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
    this._setProperty("-webkit-text-stroke-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-text-stroke-color");
  },
  enumerable: true,
  configurable: true
};
