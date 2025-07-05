"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const parsedValues = [];
  for (const value of values) {
    const parsedValue = parsers.parseImage(value);
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
      this._setProperty("background-image", v);
    } else {
      this._setProperty("background-image", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-image");
  },
  enumerable: true,
  configurable: true
};
