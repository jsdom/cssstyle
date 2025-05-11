"use strict";

var parseKeyword = require("../parsers").parseKeyword;

module.exports.isValid = function isValid(v) {
  var validFloat = ["left", "right", "none", "inline-start", "inline-end"];
  return parseKeyword(v, validFloat) !== undefined;
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
      if (v.toLowerCase() === "none") {
        v = "";
      }
      this._setProperty("float", v);
    }
  },
  get() {
    return this.getPropertyValue("float");
  },
  enumerable: true,
  configurable: true
};
