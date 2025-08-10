"use strict";

const parsers = require("../parsers");

const positions = ["top", "right", "bottom", "left"];

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("padding-right", v, {
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
      case "GlobalKeyword": {
        return name;
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
      this._setProperty("padding", "");
      this._setProperty("padding-right", v);
    } else {
      this._subImplicitSetter("padding", "right", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("padding-right");
  },
  enumerable: true,
  configurable: true
};
