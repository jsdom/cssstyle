"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "flex-shrink";
const SHORTHAND = "flex";

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
  if (Array.isArray(value) && value.length === 1) {
    const [{ isNumber, name, type, value: itemValue }] = value;
    switch (type) {
      case AST_TYPES.CALC: {
        if (isNumber) {
          return `${name}(${itemValue})`;
        }
        break;
      }
      case AST_TYPES.GLOBAL_KEY: {
        return name;
      }
      default: {
        return parsers.parseNumber(value, options);
      }
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
        this._flexBoxSetter(PROPERTY, val, priority, SHORTHAND);
      }
    }
  },
  get() {
    return this.getPropertyValue(PROPERTY);
  },
  enumerable: true,
  configurable: true
};
