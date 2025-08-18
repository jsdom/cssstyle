"use strict";

const parsers = require("../parsers");
const borderTopColor = require("./borderTopColor");
const borderRightColor = require("./borderRightColor");
const borderBottomColor = require("./borderBottomColor");
const borderLeftColor = require("./borderLeftColor");

module.exports.shorthandFor = new Map([
  ["border-top-color", borderTopColor],
  ["border-right-color", borderRightColor],
  ["border-bottom-color", borderBottomColor],
  ["border-left-color", borderLeftColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.parsePropertyValue("border-color", v, {
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
          return name;
        }
        default: {
          const parsedValue = parsers.parseColor([value]);
          if (!parsedValue) {
            return;
          }
          parsedValues.push(parsedValue);
        }
      }
    }
  } else if (typeof values === "string") {
    parsedValues.push(values);
  }
  if (parsedValues.length) {
    switch (parsedValues.length) {
      case 1: {
        return parsedValues;
      }
      case 2: {
        const [val1, val2] = parsedValues;
        if (val1 === val2) {
          return [val1];
        }
        return parsedValues;
      }
      case 3: {
        const [val1, val2, val3] = parsedValues;
        if (val1 === val3) {
          if (val1 === val2) {
            return [val1];
          }
          return [val1, val2];
        }
        return parsedValues;
      }
      case 4: {
        const [val1, val2, val3, val4] = parsedValues;
        if (val2 === val4) {
          if (val1 === val3) {
            if (val1 === val2) {
              return [val1];
            }
            return [val1, val2];
          }
          return [val1, val2, val3];
        }
        return parsedValues;
      }
      default:
    }
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._implicitBorderSetter("border-color", v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      if (Array.isArray(val) || typeof val === "string") {
        this._implicitBorderSetter("border-color", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("border-color");
  },
  enumerable: true,
  configurable: true
};
