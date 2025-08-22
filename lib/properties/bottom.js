"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("bottom", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ isNumber, name, raw, type }] = value;
    switch (type) {
      case "Calc": {
        if (!isNumber) {
          return raw;
        }
        break;
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
      this._setProperty("bottom", v);
    } else {
      this._setProperty(
        "bottom",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("bottom");
  },
  enumerable: true,
  configurable: true
};
