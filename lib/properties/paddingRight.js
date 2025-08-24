"use strict";

const parsers = require("../parsers");

module.exports.position = "right";

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
        return parsers.parseLengthPercentage(value, {
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
      this._setProperty("padding-right", v);
      this._setProperty("padding", "");
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      if (typeof val === "string") {
        this._implicitLonghandSetter("padding-right", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("padding-right");
  },
  enumerable: true,
  configurable: true
};
