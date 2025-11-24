"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "background-position";
const SHORTHAND = "background";
const KEY_X = ["left", "right"];
const KEY_Y = ["top", "bottom"];
const KEYWORDS_X = ["center", ...KEY_X];
const KEYWORDS_Y = ["center", ...KEY_Y];
const KEYWORDS = ["center", ...KEY_X, ...KEY_Y];

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
      const [part1, part2, part3, part4] = value;
      let parsedValue = "";
      switch (value.length) {
        case 1: {
          const val1 =
            part1.type === AST_TYPES.IDENTIFIER
              ? part1.name
              : parsers.parseLengthPercentage([part1], options);
          if (val1) {
            if (val1 === "center") {
              parsedValue = `${val1} ${val1}`;
            } else if (val1 === "top" || val1 === "bottom") {
              parsedValue = `center ${val1}`;
            } else {
              parsedValue = `${val1} center`;
            }
          }
          break;
        }
        case 2: {
          const val1 =
            part1.type === AST_TYPES.IDENTIFIER
              ? part1.name
              : parsers.parseLengthPercentage([part1], options);
          const val2 =
            part2.type === AST_TYPES.IDENTIFIER
              ? part2.name
              : parsers.parseLengthPercentage([part2], options);
          if (val1 && val2) {
            if (KEYWORDS_X.includes(val1) && KEYWORDS_Y.includes(val2)) {
              parsedValue = `${val1} ${val2}`;
            } else if (KEYWORDS_Y.includes(val1) && KEYWORDS_X.includes(val2)) {
              parsedValue = `${val2} ${val1}`;
            } else if (KEYWORDS_X.includes(val1)) {
              if (val2 === "center" || !KEYWORDS_X.includes(val2)) {
                parsedValue = `${val1} ${val2}`;
              }
            } else if (KEYWORDS_Y.includes(val2)) {
              if (!KEYWORDS_Y.includes(val1)) {
                parsedValue = `${val1} ${val2}`;
              }
            } else if (!KEYWORDS_Y.includes(val1) && !KEYWORDS_X.includes(val2)) {
              parsedValue = `${val1} ${val2}`;
            }
          }
          break;
        }
        case 3: {
          const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
          const val2 =
            part2.type === AST_TYPES.IDENTIFIER
              ? part2.name
              : parsers.parseLengthPercentage([part2], options);
          const val3 =
            part3.type === AST_TYPES.IDENTIFIER
              ? part3.name
              : parsers.parseLengthPercentage([part3], options);
          if (val1 && val2 && val3) {
            let posX = "";
            let offX = "";
            let posY = "";
            let offY = "";
            if (KEYWORDS_X.includes(val1)) {
              if (KEY_Y.includes(val2)) {
                if (!KEYWORDS.includes(val3)) {
                  posX = val1;
                  posY = val2;
                  offY = val3;
                }
              } else if (KEY_Y.includes(val3)) {
                if (!KEYWORDS.includes(val2)) {
                  posX = val1;
                  offX = val2;
                  posY = val3;
                }
              }
            } else if (KEYWORDS_Y.includes(val1)) {
              if (KEY_X.includes(val2)) {
                if (!KEYWORDS.includes(val3)) {
                  posX = val2;
                  offX = val3;
                  posY = val1;
                }
              } else if (KEY_X.includes(val3)) {
                if (!KEYWORDS.includes(val2)) {
                  posX = val3;
                  posY = val1;
                  offY = val2;
                }
              }
            }
            if (posX && posY) {
              if (offX) {
                parsedValue = `${posX} ${offX} ${posY}`;
              } else if (offY) {
                parsedValue = `${posX} ${posY} ${offY}`;
              }
            }
          }
          break;
        }
        case 4: {
          const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
          const val2 = parsers.parseLengthPercentage([part2], options);
          const val3 = part3.type === AST_TYPES.IDENTIFIER && part3.name;
          const val4 = parsers.parseLengthPercentage([part4], options);
          if (val1 && val2 && val3 && val4) {
            let posX = "";
            let offX = "";
            let posY = "";
            let offY = "";
            if (KEYWORDS_X.includes(val1) && KEY_Y.includes(val3)) {
              posX = val1;
              offX = val2;
              posY = val3;
              offY = val4;
            } else if (KEY_X.includes(val1) && KEYWORDS_Y.includes(val3)) {
              posX = val1;
              offX = val2;
              posY = val3;
              offY = val4;
            } else if (KEY_Y.includes(val1) && KEYWORDS_X.includes(val3)) {
              posX = val3;
              offX = val4;
              posY = val1;
              offY = val2;
            }
            if (posX && offX && posY && offY) {
              parsedValue = `${posX} ${offX} ${posY} ${offY}`;
            }
          }
          break;
        }
        default:
      }
      if (parsedValue) {
        parsedValues.push(parsedValue);
      } else {
        return;
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
