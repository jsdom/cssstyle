"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const keywords = ["border-box", "padding-box", "content-box"];
  const parsedValues = [];
  for (const value of values) {
    const parsedValue = parsers.parseKeyword(value, keywords);
    if (parsedValue) {
      parsedValues.push(parsedValue);
    } else {
      return;
    }
  }
  if (parsedValues.length) {
    return parsedValues.join(", ");
  }
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
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
