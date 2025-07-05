"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const keywordsAxis = ["repeat-x", "repeat-y"];
  const keywordsRepeat = ["repeat", "no-repeat", "space", "round"];
  const keywords = [...keywordsAxis, ...keywordsRepeat];
  const parsedValues = [];
  for (const value of values) {
    const parts = parsers.splitValue(value);
    if (!parts.length || parts.length > 2) {
      return;
    }
    let parsedValue = "";
    switch (parts.length) {
      case 1: {
        const [part] = parts;
        const val = parsers.parseKeyword(part, keywords);
        if (val) {
          parsedValue = val;
        }
        break;
      }
      case 2:
      default: {
        const [part1, part2] = parts;
        const val1 = parsers.parseKeyword(part1, keywordsRepeat);
        const val2 = parsers.parseKeyword(part2, keywordsRepeat);
        if (val1 && val2) {
          if (val1 === "repeat" && val2 === "no-repeat") {
            parsedValue = "repeat-x";
          } else if (val1 === "no-repeat" && val2 === "repeat") {
            parsedValue = "repeat-y";
          } else if (val1 === val2) {
            parsedValue = val1;
          } else {
            parsedValue = `${val1} ${val2}`;
          }
        }
      }
    }
    if (parsedValue) {
      parsedValues.push(parsedValue);
    } else {
      return;
    }
  }
  if (parsedValues.length) {
    return parsedValues.join(", ");
  }
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("background", "");
      this._setProperty("background-repeat", v);
    } else {
      this._setProperty("background-repeat", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-repeat");
  },
  enumerable: true,
  configurable: true
};
