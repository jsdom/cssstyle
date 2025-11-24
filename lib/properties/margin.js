"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const marginTop = require("./marginTop");
const marginRight = require("./marginRight");
const marginBottom = require("./marginBottom");
const marginLeft = require("./marginLeft");

const PROPERTY = "margin";
const MARGIN_TOP = "margin-top";
const MARGIN_RIGHT = "margin-right";
const MARGIN_BOTTOM = "margin-bottom";
const MARGIN_LEFT = "margin-left";

module.exports.position = "edges";

module.exports.shorthandFor = new Map([
  [MARGIN_TOP, marginTop],
  [MARGIN_RIGHT, marginRight],
  [MARGIN_BOTTOM, marginBottom],
  [MARGIN_LEFT, marginLeft]
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
        case AST_TYPES.IDENTIFIER: {
          parsedValues.push(name);
          break;
        }
        default: {
          const parsedValue = parsers.parseLengthPercentage([value], options);
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
