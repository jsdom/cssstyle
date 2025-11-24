"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "font-variant";
const SHORTHAND = "font";

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const values = parsers.splitValue(v);
  const parsedValues = [];
  for (const val of values) {
    const value = parsers.parsePropertyValue(PROPERTY, val, {
      globalObject,
      options,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ name, type, value: itemValue }] = value;
      switch (type) {
        case AST_TYPES.FUNCTION: {
          parsedValues.push(`${name}(${itemValue})`);
          break;
        }
        case AST_TYPES.GLOBAL_KEY:
        case AST_TYPES.IDENTIFIER: {
          parsedValues.push(name);
          break;
        }
        default: {
          return;
        }
      }
    } else if (typeof value === "string") {
      parsedValues.push(value);
    }
  }
  const l = parsedValues.length;
  if (l) {
    if (l > 1) {
      if (parsedValues.includes("normal") || parsedValues.includes("none")) {
        return;
      }
    }
    return parsedValues.join(" ");
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
