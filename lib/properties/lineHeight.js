"use strict";

const TYPES = require("../parsers").TYPES;
const valueType = require("../parsers").valueType;

module.exports.isValid = function isValid(v) {
  const type = valueType(v);
  return (
    (type === TYPES.KEYWORD && v.toLowerCase() === "normal") ||
    v.toLowerCase() === "inherit" ||
    type === TYPES.NUMBER ||
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT
  );
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (module.exports.isValid(v)) {
      this._setProperty("line-height", v);
    }
  },
  get() {
    return this.getPropertyValue("line-height");
  },
  enumerable: true,
  configurable: true
};
