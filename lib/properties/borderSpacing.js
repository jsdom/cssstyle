"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  if (v === "") {
    return v;
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

module.exports.isValid = function isValid(v) {
  v = parsers.prepareValue(v);
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._setProperty("border-spacing", parse(v));
  },
  get() {
    return this.getPropertyValue("border-spacing");
  },
  enumerable: true,
  configurable: true
};
