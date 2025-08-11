"use strict";

const parsers = require("../parsers");

const positions = ["top", "right", "bottom", "left"];

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.parsePropertyValue("padding", v, {
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
          parsedValues.push(name);
          break;
        }
        default: {
          const parsedValue = parsers.parseMeasurement([value], {
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
    return parsedValues.join(" ");
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
