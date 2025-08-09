"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const parsedValues = [];
  for (const val of values) {
    const value = parsers.parsePropertyValue("background-size", val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length) {
      if (value.length === 1) {
        const [{ isNumber, name, raw, type }] = value;
        switch (type) {
          case "Calc": {
            if (isNumber) {
              return;
            }
            parsedValues.push(raw);
            break;
          }
          case "GlobalKeyword":
          case "Identifier": {
            parsedValues.push(name);
            break;
          }
          default: {
            const parsedValue = parsers.parseMeasurement(value);
            if (!parsedValue) {
              return;
            }
            parsedValues.push(parsedValue);
          }
        }
      } else {
        const [val1, val2] = value;
        const parts = [];
        if (val1.type === "Calc" && !val1.isNumber) {
          parts.push(val1.raw);
        } else if (val1.type === "Identifier") {
          parts.push(val1.name);
        } else if (val1.type === "Dimension") {
          parts.push(`${val1.value}${val1.unit}`);
        } else if (val1.type === "Percentage") {
          parts.push(`${val1.value}%`);
        } else {
          return;
        }
        switch (val2.type) {
          case "Calc": {
            if (val2.isNumber) {
              return;
            }
            parts.push(val2.raw);
            break;
          }
          case "Dimension": {
            parts.push(`${val2.value}${val2.unit}`);
            break;
          }
          case "Identifier": {
            if (val2.name !== "auto") {
              parts.push(val2.name);
            }
            break;
          }
          case "Percentage": {
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
    if (parsers.hasVarFunc(v)) {
      this._setProperty("background", "");
      this._setProperty("background-size", v);
    } else {
      this._setProperty(
        "background-size",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("background-size");
  },
  enumerable: true,
  configurable: true
};
