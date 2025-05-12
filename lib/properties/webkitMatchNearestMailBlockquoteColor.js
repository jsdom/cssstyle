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
    this._setProperty("-webkit-match-nearest-mail-blockquote-color", parseColor(v));
  },
  get() {
    return this.getPropertyValue("-webkit-match-nearest-mail-blockquote-color");
  },
  enumerable: true,
  configurable: true
};
