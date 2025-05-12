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
    this._setProperty("-webkit-border-start-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-border-start-color");
  },
  enumerable: true,
  configurable: true
};
