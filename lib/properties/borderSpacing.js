"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (!parsers.isValidPropertyValue("border-spacing", v)) {
    return;
  }
  const key = parsers.parseKeyword(v);
  if (key) {
    return key;
  }
  const parts = parsers.splitValue(v);
  if (!parts.length || parts.length > 2) {
    return;
  }
  const val = [];
  for (const part of parts) {
    const dim = parsers.parseLength(part);
    if (!dim) {
      return;
    }
    val.push(dim);
  }
  return val.join(" ");
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-spacing", v);
    } else {
      this._setProperty("border-spacing", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("border-spacing");
  },
  enumerable: true,
  configurable: true
};
