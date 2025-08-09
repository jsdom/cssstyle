"use strict";

const parsers = require("../parsers");

const positions = ["top", "right", "bottom", "left"];

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("margin-left", v, {
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
        return parsers.parseMeasurement(value);
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
      this._setProperty("margin", "");
      this._setProperty("margin-left", v);
    } else {
      this._subImplicitSetter("margin", "left", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("margin-left");
  },
  enumerable: true,
  configurable: true
};
