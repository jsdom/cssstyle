"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "background-size";
const SHORTHAND = "background";

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const parsedValues = [];
  for (const val of values) {
    const value = parsers.parsePropertyValue(PROPERTY, val, {
      globalObject,
      options,
      inArray: true
    });
    if (Array.isArray(value) && value.length) {
      if (value.length === 1) {
        const [{ isNumber, name, type, value: itemValue }] = value;
        switch (type) {
          case AST_TYPES.CALC: {
            if (isNumber) {
              return;
            }
            parsedValues.push(`${name}(${itemValue})`);
            break;
          }
          case AST_TYPES.GLOBAL_KEY:
          case AST_TYPES.IDENTIFIER: {
            parsedValues.push(name);
            break;
          }
          default: {
            const parsedValue = parsers.parseLengthPercentage(value, options);
            if (!parsedValue) {
              return;
            }
            parsedValues.push(parsedValue);
          }
        }
      } else {
        const [val1, val2] = value;
        const parts = [];
        if (val1.type === AST_TYPES.CALC && !val1.isNumber) {
          parts.push(`${val1.name}(${val1.value})`);
        } else if (val1.type === AST_TYPES.IDENTIFIER) {
          parts.push(val1.name);
        } else if (val1.type === AST_TYPES.DIMENSION) {
          parts.push(`${val1.value}${val1.unit}`);
        } else if (val1.type === AST_TYPES.PERCENTAGE) {
          parts.push(`${val1.value}%`);
        } else {
          return;
        }
        switch (val2.type) {
          case AST_TYPES.CALC: {
            if (val2.isNumber) {
              return;
            }
            parts.push(`${val2.name}(${val2.value})`);
            break;
          }
          case AST_TYPES.DIMENSION: {
            parts.push(`${val2.value}${val2.unit}`);
            break;
          }
          case AST_TYPES.IDENTIFIER: {
            if (val2.name !== "auto") {
              parts.push(val2.name);
            }
            break;
          }
          case AST_TYPES.PERCENTAGE: {
            parts.push(`${val2.value}%`);
            break;
          }
          default: {
            return;
          }
        }
        parsedValues.push(parts.join(" "));
      }
    } else if (typeof value === "string") {
      parsedValues.push(value);
    }
  }
  if (parsedValues.length) {
    return parsedValues.join(", ");
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
      this._setProperty(SHORTHAND, "");
      this._setProperty(PROPERTY, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const shorthandPriority = this._priorities.get(SHORTHAND);
        const prior = this._priorities.get(PROPERTY) ?? "";
        const priority = shorthandPriority && prior ? "" : prior;
        this._setProperty(PROPERTY, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(PROPERTY);
  },
  enumerable: true,
  configurable: true
};
