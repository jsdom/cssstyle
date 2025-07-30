"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  return parsers.parseNumber(v, true);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("flex", "");
      this._setProperty("flex-grow", v);
    } else {
      this._setProperty("flex-grow", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("flex-grow");
  },
  enumerable: true,
  configurable: true
};
