"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("line-height", v, {
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
        return parsers.parseNumber(value, {
          min: 0
        });
      }
      default: {
        return parsers.parseMeasurement(value, {
          min: 0
        });
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
      this._setProperty("font", "");
      this._setProperty("line-height", v);
    } else {
      this._setProperty(
        "line-height",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("line-height");
  },
  enumerable: true,
  configurable: true
};
