"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  return parsers.parseImage(v);
};

module.exports.isValid = function isValid(v) {
  if (v === "" || typeof parsers.parseKeyword(v, ["none"]) === "string") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("background-image", parse(v));
  },
  get() {
    return this.getPropertyValue("background-image");
  },
  enumerable: true,
  configurable: true
};
