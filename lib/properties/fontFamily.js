"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "font-family";
const SHORTHAND = "font";

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
      caseSensitive: true,
      inArray: true
    });
    if (Array.isArray(value) && value.length) {
      if (value.length === 1) {
        const [{ name, type, value: itemValue }] = value;
        switch (type) {
          case AST_TYPES.FUNCTION: {
            parsedValues.push(`${name}(${itemValue})`);
            break;
          }
          case AST_TYPES.GLOBAL_KEY:
          case AST_TYPES.IDENTIFIER: {
            if (name !== "undefined") {
              parsedValues.push(name);
            }
            break;
          }
          case AST_TYPES.STRING: {
            const parsedValue = itemValue.replaceAll("\\", "").replaceAll('"', '\\"');
            parsedValues.push(`"${parsedValue}"`);
            break;
          }
          default: {
            return;
          }
        }
      } else {
        const parts = [];
        for (const item of value) {
          const { name, type } = item;
          if (type === AST_TYPES.IDENTIFIER) {
            parts.push(name);
          } else {
            return;
          }
        }
        const parsedValue = parts.join(" ").replaceAll("\\", "").replaceAll('"', '\\"');
        parsedValues.push(`"${parsedValue}"`);
      }
    } else if (typeof value === "string") {
      parsedValues.push(value);
    } else {
      return;
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
