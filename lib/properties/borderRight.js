"use strict";

const parsers = require("../parsers");
const borderRightWidth = require("./borderRightWidth");
const borderRightStyle = require("./borderRightStyle");
const borderRightColor = require("./borderRightColor");

const property = "border-right";
const shorthand = "border";

const subProps = {
  width: borderRightWidth.property,
  style: borderRightStyle.property,
  color: borderRightColor.property
};

const initialValues = new Map([
  [borderRightWidth.property, "medium"],
  [borderRightStyle.property, "none"],
  [borderRightColor.property, "currentcolor"]
]);

const shorthandFor = new Map([
  [borderRightWidth.property, borderRightWidth],
  [borderRightStyle.property, borderRightStyle],
  [borderRightColor.property, borderRightColor]
]);

const parse = (v) => {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue(property, val);
    if (Array.isArray(value) && value.length === 1) {
      const parsedValue = parsers.resolveBorderShorthandValue(value, subProps, parsedValues);
      if (typeof parsedValue === "string") {
        return parsedValue;
      } else if (Array.isArray(parsedValue)) {
        const [key, resolvedVal] = parsedValue;
        parsedValues.set(key, resolvedVal);
      } else {
        return;
      }
    } else {
      return;
    }
  }
  if (parsedValues.size) {
    const keys = shorthandFor.keys();
    const obj = {
      [borderRightWidth.property]: "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj[borderRightWidth.property] && obj[borderRightWidth.property] === "medium") {
            delete obj[borderRightWidth.property];
          }
        }
      }
    }
    return obj;
  }
};

const descriptor = {
  set(v) {
    v = parsers.prepareValue(v);
    if (parsers.hasVarFunc(v)) {
      this._borderSetter(property, v, "");
    } else {
      const val = parse(v);
      if (val || typeof val === "string") {
        const priority =
          !this._priorities.get(shorthand) && this._priorities.has(property)
            ? this._priorities.get(property)
            : "";
        if (this._updating) {
          const shorthandValue =
            typeof val === "string"
              ? val
              : (Array.isArray(val) ? val : Object.values(val)).join(" ");
          this._setProperty(property, shorthandValue, priority);
        } else {
          this._borderSetter(property, val, priority);
        }
      }
    }
  },
  get() {
    return this.getPropertyValue(property);
  },
  enumerable: true,
  configurable: true
};

module.exports = {
  descriptor,
  initialValues,
  parse,
  property,
  shorthandFor
};
