"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "border-top-width";
const LINE_SHORTHAND = "border-width";
const POSITION_SHORTHAND = "border-top";
const SHORTHAND = "border";

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
          return;
        }
        return `${name}(${itemValue})`;
      }
      case AST_TYPES.GLOBAL_KEY:
      case AST_TYPES.IDENTIFIER: {
        return name;
      }
      default: {
        const parseOpt = {
          min: 0
        };
        for (const [key, val] of Object.entries(options)) {
          parseOpt[key] = val;
        }
        return parsers.parseLength(value, parseOpt);
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
      this._borderSetter(PROPERTY, v, "");
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const shorthandPriority = this._priorities.get(SHORTHAND);
        const linePriority = this._priorities.get(LINE_SHORTHAND);
        const positionPriority = this._priorities.get(POSITION_SHORTHAND);
        let priority = this._priorities.get(PROPERTY) ?? "";
        if ((shorthandPriority || linePriority || positionPriority) && priority) {
          priority = "";
        }
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
