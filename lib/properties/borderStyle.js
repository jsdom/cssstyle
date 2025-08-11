"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.parsePropertyValue("border-style", v, {
    globalObject,
    inArray: true
  });
  const parsedValues = [];
  if (Array.isArray(values) && values.length) {
    if (values.length > 4) {
      return;
    }
    for (const value of values) {
      const { name, type } = value;
      switch (type) {
        case "GlobalKeyword": {
          if (values.length !== 1) {
            return;
          }
          parsedValues.push(name);
          break;
        }
        case "Identifier": {
          parsedValues.push(name);
          break;
        }
        default: {
          return;
        }
      }
    }
  } else if (typeof values === "string") {
    parsedValues.push(values);
  }
  if (parsedValues.length) {
    return parsedValues.join(" ");
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-style", v);
    } else {
      this._setProperty("border", "");
      this._implicitSetter("border", "style", v, module.exports.parse, [
        "top",
        "right",
        "bottom",
        "left"
      ]);
    }
  },
  get() {
    return this.getPropertyValue("border-style");
  },
  enumerable: true,
  configurable: true
};
