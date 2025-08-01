"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.isValidPropertyValue("font-style", v)) {
    return strings.asciiLowercase(v);
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("font", "");
      this._setProperty("font-style", v);
    } else {
      this._setProperty("font-style", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("font-style");
  },
  enumerable: true,
  configurable: true
};
