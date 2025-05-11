"use strict";

var parsers = require("../parsers");

var parse = function parse(v) {
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === "collapse" ||
      v.toLowerCase() === "separate" ||
      v.toLowerCase() === "inherit")
  ) {
    return v;
  }
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("border-collapse", parse(v));
  },
  get() {
    return this.getPropertyValue("border-collapse");
  },
  enumerable: true,
  configurable: true
};
