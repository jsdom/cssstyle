"use strict";

const parsers = require("../parsers");

const parser = function (v) {
  const parsed = parsers.parseColor(v);
  if (parsed !== undefined) {
    return parsed;
  }
  if (parsers.valueType(v) === parsers.TYPES.KEYWORD && v.toLowerCase() === "inherit") {
    return v;
  }
};

module.exports.isValid = function isValid(v) {
  return parser(v) !== undefined;
};

module.exports.definition = {
  set(v) {
    this._implicitSetter("border", "color", v, module.exports.isValid, parser);
  },
  get() {
    return this.getPropertyValue("border-color");
  },
  enumerable: true,
  configurable: true
};
