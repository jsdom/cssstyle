"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("border-top-width", v, {
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
        return parsers.parseLength(value, {
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
      this._setProperty("border", "");
      this._setProperty("border-width", "");
      this._setProperty("border-top", "");
      this._setProperty("border-top-width", v);
    } else {
      this._setProperty(
        "border-top-width",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("border-top-width");
  },
  enumerable: true,
  configurable: true
};
