"use strict";

const parsers = require("../parsers");

const positions = ["top", "right", "bottom", "left"];

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("margin-top", v, {
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
      this._setProperty("margin-top", v);
    } else {
      this._subImplicitSetter("margin", "top", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("margin-top");
  },
  enumerable: true,
  configurable: true
};
