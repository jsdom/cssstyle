"use strict";

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.isValidPropertyValue("background-origin", v)) {
    const val = strings.asciiLowercase(v);
    return parsers.splitValue(val, { delimiter: "," }).join(", ");
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("background", "");
      this._setProperty("background-origin", v);
    } else {
      this._setProperty("background-origin", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-origin");
  },
  enumerable: true,
  configurable: true
};
