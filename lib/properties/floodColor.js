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
    this._setProperty("flood-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("flood-color");
  },
  enumerable: true,
  configurable: true
};
