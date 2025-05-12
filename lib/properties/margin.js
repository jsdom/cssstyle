"use strict";

const parsers = require("../parsers");
const TYPES = parsers.TYPES;

module.exports.isValid = function (v) {
  const type = parsers.valueType(v);
  if (
    type === TYPES.NULL_OR_EMPTY_STR ||
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT ||
    type === TYPES.CALC ||
    (type === TYPES.NUMBER && parseFloat(v) === 0)
  ) {
    return true;
  }
  return type === TYPES.KEYWORD && parsers.parseKeyword(v, ["auto"]);
};

module.exports.parser = function (v) {
  if (v.toLowerCase() === "auto") {
    return v.toLowerCase();
  }
  return parsers.parseMeasurement(v);
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (typeof v === "number") {
      v = v.toString();
    }
    if (typeof v !== "string") {
      return;
    }
    this._implicitSetter("margin", "", v, module.exports.isValid, module.exports.parser);
  },
  get() {
    return this.getPropertyValue("margin");
  },
  enumerable: true,
  configurable: true
};
