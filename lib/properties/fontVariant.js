"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  if (parsers.isValidPropertyValue("font-variant", v)) {
    const val = strings.asciiLowercase(v);
    return parsers.splitValue(val).join(" ");
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("font", "");
      this._setProperty("font-valiant", v);
    } else {
      this._setProperty("font-variant", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("font-variant");
  },
  enumerable: true,
  configurable: true
};
