"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "display";
const BLOCK = "block";
const FLEX = "flex";
const FLOW = "flow";
const FLOW_ROOT = "flow-root";
const GRID = "grid";
const INLINE = "inline";
const LIST_ITEM = "list-item";
const RUBY = "ruby";
const RUN_IN = "run-in";
const TABLE = "table";
const DISPLAY_OUTSIDE = [BLOCK, INLINE, RUN_IN];
const DISPLAY_FLOW = [FLOW, FLOW_ROOT];

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
    switch (value.length) {
      case 1: {
        const [{ name, type }] = value;
        switch (type) {
          case AST_TYPES.GLOBAL_KEY: {
            return name;
          }
          case AST_TYPES.IDENTIFIER: {
            if (name === FLOW) {
              return BLOCK;
            }
            return name;
          }
          default:
        }
        break;
      }
      case 2: {
        const [part1, part2] = value;
        const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
        const val2 = part2.type === AST_TYPES.IDENTIFIER && part2.name;
        if (val1 && val2) {
          let outerValue = "";
          let innerValue = "";
          if (val1 === LIST_ITEM) {
            outerValue = val2;
            innerValue = val1;
          } else if (val2 === LIST_ITEM) {
            outerValue = val1;
            innerValue = val2;
          } else if (DISPLAY_OUTSIDE.includes(val1)) {
            outerValue = val1;
            innerValue = val2;
          } else if (DISPLAY_OUTSIDE.includes(val2)) {
            outerValue = val2;
            innerValue = val1;
          }
          if (innerValue === LIST_ITEM) {
            switch (outerValue) {
              case BLOCK:
              case FLOW: {
                return innerValue;
              }
              case FLOW_ROOT:
              case INLINE:
              case RUN_IN: {
                return `${outerValue} ${innerValue}`;
              }
              default:
            }
          } else if (outerValue === BLOCK) {
            switch (innerValue) {
              case FLOW: {
                return outerValue;
              }
              case FLOW_ROOT:
              case FLEX:
              case GRID:
              case TABLE: {
                return innerValue;
              }
              case RUBY: {
                return `${outerValue} ${innerValue}`;
              }
              default:
            }
          } else if (outerValue === INLINE) {
            switch (innerValue) {
              case FLOW: {
                return outerValue;
              }
              case FLOW_ROOT: {
                return `${outerValue}-block`;
              }
              case FLEX:
              case GRID:
              case TABLE: {
                return `${outerValue}-${innerValue}`;
              }
              case RUBY: {
                return innerValue;
              }
              default:
            }
          } else if (outerValue === RUN_IN) {
            switch (innerValue) {
              case FLOW: {
                return outerValue;
              }
              case FLOW_ROOT:
              case FLEX:
              case GRID:
              case TABLE:
              case RUBY: {
                return `${outerValue} ${innerValue}`;
              }
              default:
            }
          }
        }
        break;
      }
      case 3: {
        const [part1, part2, part3] = value;
        const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
        const val2 = part2.type === AST_TYPES.IDENTIFIER && part2.name;
        const val3 = part3.type === AST_TYPES.IDENTIFIER && part3.name;
        if (val1 && val2 && part3) {
          let outerValue = "";
          let flowValue = "";
          let listItemValue = "";
          if (val1 === LIST_ITEM) {
            listItemValue = val1;
            if (DISPLAY_FLOW.includes(val2)) {
              flowValue = val2;
              outerValue = val3;
            } else if (DISPLAY_FLOW.includes(val3)) {
              flowValue = val3;
              outerValue = val2;
            }
          } else if (val2 === LIST_ITEM) {
            listItemValue = val2;
            if (DISPLAY_FLOW.includes(val1)) {
              flowValue = val1;
              outerValue = val3;
            } else if (DISPLAY_FLOW.includes(val3)) {
              flowValue = val3;
              outerValue = val1;
            }
          } else if (val3 === LIST_ITEM) {
            listItemValue = val3;
            if (DISPLAY_FLOW.includes(val1)) {
              flowValue = val1;
              outerValue = val2;
            } else if (DISPLAY_FLOW.includes(val2)) {
              flowValue = val2;
              outerValue = val1;
            }
          }
          if (outerValue && flowValue && listItemValue) {
            switch (outerValue) {
              case BLOCK: {
                if (flowValue === FLOW) {
                  return listItemValue;
                }
                return `${flowValue} ${listItemValue}`;
              }
              case INLINE:
              case RUN_IN: {
                if (flowValue === FLOW) {
                  return `${outerValue} ${listItemValue}`;
                }
                return `${outerValue} ${flowValue} ${listItemValue}`;
              }
            }
          }
        }
        break;
      }
      default:
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
      this._setProperty(PROPERTY, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const priority = this._priorities.get(PROPERTY) ?? "";
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
