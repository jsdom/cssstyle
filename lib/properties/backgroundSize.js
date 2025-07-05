"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const keywordsRatio = ["contain", "cover"];
  const keywordsRepeat = ["auto"];
  const keywords = [...keywordsRatio, ...keywordsRepeat];
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
        const val = parsers.parseMeasurement(part, true) || parsers.parseKeyword(part, keywords);
        if (val) {
          parsedValue = val;
        }
        break;
      }
      case 2:
      default: {
        const [part1, part2] = parts;
        const val1 =
          parsers.parseMeasurement(part1, true) || parsers.parseKeyword(part1, keywordsRepeat);
        const val2 =
          parsers.parseMeasurement(part2, true) || parsers.parseKeyword(part2, keywordsRepeat);
        if (val1 && val2) {
          if (val2 === "auto") {
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
      this._setProperty("background-size", v);
    } else {
      this._setProperty("background-size", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-size");
  },
  enumerable: true,
  configurable: true
};
