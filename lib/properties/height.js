"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("height", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ isNumber, name, type, value: itemValue }] = value;
    switch (type) {
      case "Calc": {
        if (isNumber) {
          return;
        }
        return `${name}(${itemValue})`;
      }
      case "GlobalKeyword":
      case "Identifier": {
        return name;
      }
      default: {
        return parsers.parseLengthPercentage(value);
      }
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("height", v);
    } else {
      this._setProperty(
        "height",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("height");
  },
  enumerable: true,
  configurable: true
};
