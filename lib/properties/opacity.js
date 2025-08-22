"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("opacity", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ name, type, value: itemValue }] = value;
    switch (type) {
      case "Calc": {
        return `${name}(${itemValue})`;
      }
      case "GlobalKeyword":
      case "Identifier": {
        return name;
      }
      case "Number": {
        return parsers.parseNumber(value);
      }
      case "Percentage": {
        return parsers.parsePercentage(value);
      }
      default:
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("opacity", v);
    } else {
      this._setProperty(
        "opacity",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("opacity");
  },
  enumerable: true,
  configurable: true
};
