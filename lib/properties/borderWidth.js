"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const keywords = ["thin", "medium", "thick"];
  const key = parsers.parseKeyword(v, keywords);
  if (key) {
    return key;
  }
  return parsers.parseLength(v, true);
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._implicitSetter("border", "width", v, module.exports.isValid, module.exports.parse);
  },
  get() {
    return this.getPropertyValue("border-width");
  },
  enumerable: true,
  configurable: true
};
