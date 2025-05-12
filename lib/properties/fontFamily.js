"use strict";

const TYPES = require("../parsers").TYPES;
const valueType = require("../parsers").valueType;

module.exports.isValid = function isValid(v) {
  if (v === "" || v === null) {
    return true;
  }
  const parts = v.split(/\s*,\s*/);
  for (let i = 0; i < parts.length; i++) {
    const type = valueType(parts[i]);
    if (type === TYPES.STRING || type === TYPES.KEYWORD) {
      return true;
    }
  }
  return false;
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
      this._setProperty("font-family", v);
    }
  },
  get() {
    return this.getPropertyValue("font-family");
  },
  enumerable: true,
  configurable: true
};
