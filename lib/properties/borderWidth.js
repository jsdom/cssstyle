"use strict";

const parsers = require("../parsers");
const borderTopWidth = require("./borderTopWidth");
const borderRightWidth = require("./borderRightWidth");
const borderBottomWidth = require("./borderBottomWidth");
const borderLeftWidth = require("./borderLeftWidth");

module.exports.shorthandFor = new Map([
  ["border-top-width", borderTopWidth],
  ["border-right-width", borderRightWidth],
  ["border-bottom-width", borderBottomWidth],
  ["border-left-width", borderLeftWidth]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.parsePropertyValue("border-width", v, {
    globalObject,
    inArray: true
  });
  const parsedValues = [];
  if (Array.isArray(values) && values.length) {
    if (values.length > 4) {
      return;
    }
    for (const value of values) {
      const { isNumber, name, type, value: itemValue } = value;
      switch (type) {
        case "Calc": {
          if (isNumber) {
            return;
          }
          parsedValues.push(`${name}(${itemValue})`);
          break;
        }
        case "GlobalKeyword": {
          if (values.length !== 1) {
            return;
          }
          return name;
        }
        case "Identifier": {
          parsedValues.push(name);
          break;
        }
        default: {
          const parsedValue = parsers.parseLength([value], {
            min: 0
          });
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
      this._implicitBorderSetter("border-width", v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      if (Array.isArray(val) || typeof val === "string") {
        this._implicitBorderSetter("border-width", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("border-width");
  },
  enumerable: true,
  configurable: true
};
