"use strict";

var parsers = require("../parsers");

module.exports.isValid = function isValid(v) {
  return (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === "scroll" || v.toLowerCase() === "fixed" || v.toLowerCase() === "inherit")
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
      this._setProperty("background-attachment", v);
    }
  },
  get() {
    return this.getPropertyValue("background-attachment");
  },
  enumerable: true,
  configurable: true
};
