"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const borderTopWidth = require("./borderTopWidth");
const borderRightWidth = require("./borderRightWidth");
const borderBottomWidth = require("./borderBottomWidth");
const borderLeftWidth = require("./borderLeftWidth");

const PROPERTY = "border-width";
const SHORTHAND = "border";
const BORDER_TOP_WIDTH = "border-top-width";
const BORDER_RIGHT_WIDTH = "border-right-width";
const BORDER_BOTTOM_WIDTH = "border-bottom-width";
const BORDER_LEFT_WIDTH = "border-left-width";

module.exports.shorthandFor = new Map([
  [BORDER_TOP_WIDTH, borderTopWidth],
  [BORDER_RIGHT_WIDTH, borderRightWidth],
  [BORDER_BOTTOM_WIDTH, borderBottomWidth],
  [BORDER_LEFT_WIDTH, borderLeftWidth]
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
          return name;
        }
        case AST_TYPES.IDENTIFIER: {
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
          const parsedValue = parsers.parseLength([value], parseOpt);
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
      this._borderSetter(PROPERTY, v, "");
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (Array.isArray(val) || typeof val === "string") {
        const shorthandPriority = this._priorities.get(SHORTHAND);
        const prior = this._priorities.get(PROPERTY) ?? "";
        const priority = shorthandPriority && prior ? "" : prior;
        this._borderSetter(PROPERTY, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(PROPERTY);
  },
  enumerable: true,
  configurable: true
};
