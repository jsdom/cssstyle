"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const borderBottomWidth = require("./borderBottomWidth");
const borderBottomStyle = require("./borderBottomStyle");
const borderBottomColor = require("./borderBottomColor");

const PROPERTY = "border-bottom";
const SHORTHAND = "border";
const BORDER_BOTTOM_WIDTH = "border-bottom-width";
const BORDER_BOTTOM_STYLE = "border-bottom-style";
const BORDER_BOTTOM_COLOR = "border-bottom-color";

module.exports.initialValues = new Map([
  [BORDER_BOTTOM_WIDTH, "medium"],
  [BORDER_BOTTOM_STYLE, "none"],
  [BORDER_BOTTOM_COLOR, "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  [BORDER_BOTTOM_WIDTH, borderBottomWidth],
  [BORDER_BOTTOM_STYLE, borderBottomStyle],
  [BORDER_BOTTOM_COLOR, borderBottomColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue(PROPERTY, val, {
      globalObject,
      options,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ isNumber, name, type, value: itemValue }] = value;
      switch (type) {
        case AST_TYPES.CALC: {
          if (isNumber || parsedValues.has(BORDER_BOTTOM_WIDTH)) {
            return;
          }
          parsedValues.set(BORDER_BOTTOM_WIDTH, `${name}(${itemValue})`);
          break;
        }
        case AST_TYPES.DIMENSION:
        case AST_TYPES.NUMBER: {
          if (parsedValues.has(BORDER_BOTTOM_WIDTH)) {
            return;
          }
          const parseOpt = {
            min: 0
          };
          for (const [key, optVal] of Object.entries(options)) {
            parseOpt[key] = optVal;
          }
          const parsedValue = parsers.parseLength(value, parseOpt);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(BORDER_BOTTOM_WIDTH, parsedValue);
          break;
        }
        case AST_TYPES.FUNCTION: {
          if (parsedValues.has(BORDER_BOTTOM_COLOR)) {
            return;
          }
          const parsedValue = parsers.parseColor(value, options);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(BORDER_BOTTOM_COLOR, parsedValue);
          break;
        }
        case AST_TYPES.GLOBAL_KEY: {
          return name;
        }
        case AST_TYPES.HASH: {
          if (parsedValues.has(BORDER_BOTTOM_COLOR)) {
            return;
          }
          const parsedValue = parsers.parseColor(value, options);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(BORDER_BOTTOM_COLOR, parsedValue);
          break;
        }
        case AST_TYPES.IDENTIFIER: {
          if (parsers.isValidPropertyValue(BORDER_BOTTOM_WIDTH, name, globalObject)) {
            if (parsedValues.has(BORDER_BOTTOM_WIDTH)) {
              return;
            }
            parsedValues.set(BORDER_BOTTOM_WIDTH, name);
            break;
          } else if (parsers.isValidPropertyValue(BORDER_BOTTOM_STYLE, name, globalObject)) {
            if (parsedValues.has(BORDER_BOTTOM_STYLE)) {
              return;
            }
            parsedValues.set(BORDER_BOTTOM_STYLE, name);
            break;
          } else if (parsers.isValidPropertyValue(BORDER_BOTTOM_COLOR, name, globalObject)) {
            if (parsedValues.has(BORDER_BOTTOM_COLOR)) {
              return;
            }
            parsedValues.set(BORDER_BOTTOM_COLOR, name);
            break;
          }
          return;
        }
        default: {
          return;
        }
      }
    } else {
      return;
    }
  }
  if (parsedValues.size) {
    const keys = module.exports.shorthandFor.keys();
    const obj = {
      [BORDER_BOTTOM_WIDTH]: "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== module.exports.initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj[BORDER_BOTTOM_WIDTH] && obj[BORDER_BOTTOM_WIDTH] === "medium") {
            delete obj[BORDER_BOTTOM_WIDTH];
          }
        }
      }
    }
    return obj;
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
      if (val || typeof val === "string") {
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
