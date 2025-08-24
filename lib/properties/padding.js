"use strict";

const parsers = require("../parsers");
const paddingTop = require("./paddingTop");
const paddingRight = require("./paddingRight");
const paddingBottom = require("./paddingBottom");
const paddingLeft = require("./paddingLeft");

module.exports.position = "all";

module.exports.shorthandFor = new Map([
  ["padding-top", paddingTop],
  ["padding-right", paddingRight],
  ["padding-bottom", paddingBottom],
  ["padding-left", paddingLeft]
]);

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
          const parsedValue = parsers.parseLengthPercentage([value], {
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
    return parsedValues;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      for (const [longhand] of module.exports.shorthandFor) {
        this._setProperty(longhand, "");
      }
      this._setProperty("padding", v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      if (Array.isArray(val) || typeof val === "string") {
        this._implicitShorthandSetter("padding", val);
      }
    }
  },
  get() {
    return this.getPropertyValue("padding");
  },
  enumerable: true,
  configurable: true
};
