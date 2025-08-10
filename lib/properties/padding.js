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
  const parsedValues = [];
  if (Array.isArray(value) && value.length) {
    if (value.length > 4) {
      return;
    }
    for (let i = 0; i < value.length; i++) {
      const { isNumber, name, type, value: itemValue } = value[i];
      switch (type) {
        case "Calc": {
          if (isNumber) {
            return;
          }
          parsedValues.push(`${name}(${itemValue})`);
          break;
        }
        case "GlobalKeyword": {
          if (i !== 0) {
            return;
          }
          parsedValues.push(name);
          break;
        }
        default: {
          const parsedValue = parsers.parseMeasurement([value[i]], {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.push(parsedValue);
        }
      }
    }
  } else if (typeof value === "string") {
    parsedValues.push(value);
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
