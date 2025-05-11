"use strict";

var parsers = require("../parsers");

var parse = function parse(v) {
  var parsed = parsers.parseColor(v);
  if (parsed !== undefined) {
    return parsed;
  }
  if (parsers.valueType(v) === parsers.TYPES.KEYWORD && v.toLowerCase() === "inherit") {
    return v;
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
    this._setProperty("background-color", parse(v));
  },
  get() {
    return this.getPropertyValue("background-color");
  },
  enumerable: true,
  configurable: true
};
