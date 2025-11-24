"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const borderTopColor = require("./borderTopColor");
const borderRightColor = require("./borderRightColor");
const borderBottomColor = require("./borderBottomColor");
const borderLeftColor = require("./borderLeftColor");

const PROPERTY = "border-color";
const SHORTHAND = "border";
const BORDER_TOP_COLOR = "border-top-color";
const BORDER_RIGHT_COLOR = "border-right-color";
const BORDER_BOTTOM_COLOR = "border-bottom-color";
const BORDER_LEFT_COLOR = "border-left-color";

module.exports.shorthandFor = new Map([
  [BORDER_TOP_COLOR, borderTopColor],
  [BORDER_RIGHT_COLOR, borderRightColor],
  [BORDER_BOTTOM_COLOR, borderBottomColor],
  [BORDER_LEFT_COLOR, borderLeftColor]
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
      const { name, type } = value;
      switch (type) {
        case AST_TYPES.GLOBAL_KEY: {
          if (values.length !== 1) {
            return;
          }
          return name;
        }
        default: {
          const parsedValue = parsers.parseColor([value], options);
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
