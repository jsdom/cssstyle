"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const paddingTop = require("./paddingTop");
const paddingRight = require("./paddingRight");
const paddingBottom = require("./paddingBottom");
const paddingLeft = require("./paddingLeft");

const PROPERTY = "padding";
const PADDING_TOP = "padding-top";
const PADDING_RIGHT = "padding-right";
const PADDING_BOTTOM = "padding-bottom";
const PADDING_LEFT = "padding-left";

module.exports.position = "edges";

module.exports.shorthandFor = new Map([
  [PADDING_TOP, paddingTop],
  [PADDING_RIGHT, paddingRight],
  [PADDING_BOTTOM, paddingBottom],
  [PADDING_LEFT, paddingLeft]
]);

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const values = parsers.parsePropertyValue(PROPERTY, v, {
    globalObject,
    options,
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
        case AST_TYPES.CALC: {
          if (isNumber) {
            return;
          }
          parsedValues.push(`${name}(${itemValue})`);
          break;
        }
        case AST_TYPES.GLOBAL_KEY: {
          if (values.length !== 1) {
            return;
          }
          parsedValues.push(name);
          break;
        }
        default: {
          const parseOpt = {
            min: 0
          };
          for (const [key, val] of Object.entries(options)) {
            parseOpt[key] = val;
          }
          const parsedValue = parsers.parseLengthPercentage([value], parseOpt);
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
  const l = parsedValues.length;
  if (l) {
    const [val1, val2, val3, val4] = parsedValues;
    switch (l) {
      case 1: {
        return parsedValues;
      }
      case 2: {
        if (val1 === val2) {
          return [val1];
        }
        return parsedValues;
      }
      case 3: {
        if (val1 === val3) {
          if (val1 === val2) {
            return [val1];
          }
          return [val1, val2];
        }
        return parsedValues;
      }
      case 4: {
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
    // The value has already been set.
    if (this._values.get(PROPERTY) === v && !this._priorities.get(PROPERTY)) {
      return;
    }
    if (parsers.hasVarFunc(v)) {
      for (const [longhand] of module.exports.shorthandFor) {
        this._setProperty(longhand, "");
      }
      this._setProperty(PROPERTY, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (Array.isArray(val) || typeof val === "string") {
        const priority = this._priorities.get(PROPERTY) ?? "";
        this._positionShorthandSetter(PROPERTY, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(PROPERTY);
  },
  enumerable: true,
  configurable: true
};
