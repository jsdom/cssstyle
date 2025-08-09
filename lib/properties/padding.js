"use strict";

const parsers = require("../parsers");

const positions = ["top", "right", "bottom", "left"];

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("padding", v, {
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
      this._implicitSetter("padding", "", "", module.exports.parse, positions);
      this._setProperty("padding", v);
    } else {
      this._implicitSetter("padding", "", v, module.exports.parse, positions);
    }
  },
  get() {
    const val = this._implicitGetter("padding", positions);
    if (val === "") {
      return this.getPropertyValue("padding");
    }
    if (parsers.hasVarFunc(val)) {
      return "";
    }
    return val;
  },
  enumerable: true,
  configurable: true
};
