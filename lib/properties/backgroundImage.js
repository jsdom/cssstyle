"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  const parsed = parsers.parseImage(v);
  if (parsed !== undefined) {
    return parsed;
  }
};

module.exports.isValid = function isValid(v) {
  return parse(v) !== undefined;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("background-image", parse(v));
  },
  get() {
    return this.getPropertyValue("background-image");
  },
  enumerable: true,
  configurable: true
};
