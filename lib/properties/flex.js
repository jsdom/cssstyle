"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const flexGrow = require("./flexGrow");
const flexShrink = require("./flexShrink");
const flexBasis = require("./flexBasis");

const PROPERTY = "flex";
const FLEX_GROW = "flex-grow";
const FLEX_SHRINK = "flex-shrink";
const FLEX_BASIS = "flex-basis";

module.exports.initialValues = new Map([
  [FLEX_GROW, "0"],
  [FLEX_SHRINK, "1"],
  [FLEX_BASIS, "auto"]
]);

module.exports.shorthandFor = new Map([
  [FLEX_GROW, flexGrow],
  [FLEX_SHRINK, flexShrink],
  [FLEX_BASIS, flexBasis]
]);

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const value = parsers.parsePropertyValue(PROPERTY, v, {
    globalObject,
    options,
    inArray: true
  });
  if (Array.isArray(value) && value.length) {
    const flex = {
      [FLEX_GROW]: "1",
      [FLEX_SHRINK]: "1",
      [FLEX_BASIS]: "0%"
    };
    if (value.length === 1) {
      const [{ isNumber, name, type, unit, value: itemValue }] = value;
      switch (type) {
        case AST_TYPES.CALC: {
          if (isNumber) {
            flex[FLEX_GROW] = `${name}(${itemValue})`;
            return flex;
          }
          flex[FLEX_BASIS] = `${name}(${itemValue})`;
          return flex;
        }
        case AST_TYPES.DIMENSION: {
          flex[FLEX_BASIS] = `${itemValue}${unit}`;
          return flex;
        }
        case AST_TYPES.GLOBAL_KEY: {
          return name;
        }
        case AST_TYPES.IDENTIFIER: {
          if (name === "none") {
            return {
              [FLEX_GROW]: "0",
              [FLEX_SHRINK]: "0",
              [FLEX_BASIS]: "auto"
            };
          }
          flex[FLEX_BASIS] = name;
          return flex;
        }
        case AST_TYPES.NUMBER: {
          flex[FLEX_GROW] = itemValue;
          return flex;
        }
        case AST_TYPES.PERCENTAGE: {
          flex[FLEX_BASIS] = `${itemValue}%`;
          return flex;
        }
        default:
      }
    } else {
      const [val1, val2, val3] = value;
      if (val1.type === AST_TYPES.CALC && val1.isNumber) {
        flex[FLEX_GROW] = `${val1.name}(${val1.value})`;
      } else if (val1.type === AST_TYPES.NUMBER) {
        flex[FLEX_GROW] = val1.value;
      } else {
        return;
      }
      if (val3) {
        if (val2.type === AST_TYPES.CALC && val2.isNumber) {
          flex[FLEX_SHRINK] = `${val2.name}(${val2.value})`;
        } else if (val2.type === AST_TYPES.NUMBER) {
          flex[FLEX_SHRINK] = val2.value;
        } else {
          return;
        }
        if (val3.type === AST_TYPES.GLOBAL_KEY || val3.type === AST_TYPES.IDENTIFIER) {
          flex[FLEX_BASIS] = val3.name;
        } else if (val3.type === AST_TYPES.CALC && !val3.isNumber) {
          flex[FLEX_BASIS] = `${val3.name}(${val3.value})`;
        } else if (val3.type === AST_TYPES.DIMENSION) {
          flex[FLEX_BASIS] = `${val3.value}${val3.unit}`;
        } else if (val3.type === AST_TYPES.PERCENTAGE) {
          flex[FLEX_BASIS] = `${val3.value}%`;
        } else {
          return;
        }
      } else {
        switch (val2.type) {
          case AST_TYPES.CALC: {
            if (val2.isNumber) {
              flex[FLEX_SHRINK] = `${val2.name}(${val2.value})`;
            } else {
              flex[FLEX_BASIS] = `${val2.name}(${val2.value})`;
            }
            break;
          }
          case AST_TYPES.DIMENSION: {
            flex[FLEX_BASIS] = `${val2.value}${val2.unit}`;
            break;
          }
          case AST_TYPES.IDENTIFIER: {
            flex[FLEX_BASIS] = val2.name;
            break;
          }
          case AST_TYPES.NUMBER: {
            flex[FLEX_SHRINK] = val2.value;
            break;
          }
          case AST_TYPES.PERCENTAGE: {
            flex[FLEX_BASIS] = `${val2.value}%`;
            break;
          }
          default: {
            return;
          }
        }
      }
      return flex;
    }
  } else if (typeof value === "string") {
    return value;
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
      const priority = this._priorities.get(PROPERTY) ?? "";
      if (typeof val === "string") {
        for (const [longhand] of module.exports.shorthandFor) {
          this._setProperty(longhand, val, priority);
        }
        this._setProperty(PROPERTY, val, priority);
      } else if (val) {
        const values = [];
        for (const [longhand, value] of Object.entries(val)) {
          values.push(value);
          this._setProperty(longhand, value, priority);
        }
        this._setProperty(PROPERTY, values.join(" "), priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(PROPERTY);
  },
  enumerable: true,
  configurable: true
};
