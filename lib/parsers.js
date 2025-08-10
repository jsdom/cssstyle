"use strict";

const {
  resolve: resolveColor,
  utils: { cssCalc, resolveGradient, splitValue }
} = require("@asamuzakjp/css-color");
const { next: syntaxes } = require("@csstools/css-syntax-patches-for-csstree");
const csstree = require("css-tree");
const { asciiLowercase } = require("./utils/strings");

// CSS global keywords
// @see https://drafts.csswg.org/css-cascade-5/#defaulting-keywords
const GLOBAL_KEY = Object.freeze(["initial", "inherit", "unset", "revert", "revert-layer"]);

// System colors
// @see https://drafts.csswg.org/css-color/#css-system-colors
// @see https://drafts.csswg.org/css-color/#deprecated-system-colors
const SYS_COLOR = Object.freeze([
  "accentcolor",
  "accentcolortext",
  "activeborder",
  "activecaption",
  "activetext",
  "appworkspace",
  "background",
  "buttonborder",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "canvas",
  "canvastext",
  "captiontext",
  "field",
  "fieldtext",
  "graytext",
  "highlight",
  "highlighttext",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infobackground",
  "infotext",
  "linktext",
  "mark",
  "marktext",
  "menu",
  "menutext",
  "scrollbar",
  "selecteditem",
  "selecteditemtext",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "visitedtext",
  "window",
  "windowframe",
  "windowtext"
]);

// Regular expressions
const CALC_FUNC_NAMES =
  "(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)";
const calcRegEx = new RegExp(`^${CALC_FUNC_NAMES}\\(`);
const calcContainedRegEx = new RegExp(`(?<=[*/\\s(])${CALC_FUNC_NAMES}\\(`);
const calcNameRegEx = new RegExp(`^${CALC_FUNC_NAMES}$`);
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;

// Patched css-tree.
const cssTree = csstree.fork(syntaxes);

// Prepare stringified value.
exports.prepareValue = function prepareValue(value, globalObject = globalThis) {
  // `null` is converted to an empty string.
  // @see https://webidl.spec.whatwg.org/#LegacyNullToEmptyString
  if (value === null) {
    return "";
  }
  const type = typeof value;
  switch (type) {
    case "string":
      return value.trim();
    case "number":
      return value.toString();
    case "undefined":
      return "undefined";
    case "symbol":
      throw new globalObject.TypeError("Can not convert symbol to string.");
    default: {
      const str = value.toString();
      if (typeof str === "string") {
        return str.trim();
      }
      throw new globalObject.TypeError(`Can not convert ${type} to string.`);
    }
  }
};

// Value is a global keyword.
exports.isGlobalKeyword = function isGlobalKeyword(val) {
  return GLOBAL_KEY.includes(asciiLowercase(val));
};

// Value starts with and/or contains CSS var() function.
exports.hasVarFunc = function hasVarFunc(val) {
  return varRegEx.test(val) || varContainedRegEx.test(val);
};

// Value starts with and/or contains CSS calc() related functions.
exports.hasCalcFunc = function hasCalcFunc(val) {
  return calcRegEx.test(val) || calcContainedRegEx.test(val);
};

// Splits value into an array.
// @see https://github.com/asamuzaK/cssColor/blob/main/src/js/util.ts
exports.splitValue = splitValue;

// Parse CSS to AST or Object.
exports.parseCSS = function parseCSS(val, opt, toObject = false) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  const ast = cssTree.parse(val, opt);
  if (toObject) {
    return cssTree.toPlainObject(ast);
  }
  return ast;
};

// Returns `false` for custom property and/or var().
exports.isValidPropertyValue = function isValidPropertyValue(prop, val) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  if (val === "") {
    return true;
  }
  // cssTree.lexer does not support deprecated system colors
  // @see https://github.com/w3c/webref/issues/1519#issuecomment-3120290261
  if (SYS_COLOR.includes(asciiLowercase(val))) {
    if (/^(?:-webkit-)?(?:[a-z][a-z\d]*-)*color$/i.test(prop)) {
      return true;
    }
    return false;
  }
  let ast;
  try {
    ast = exports.parseCSS(val, {
      context: "value"
    });
  } catch {
    return false;
  }
  const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
  return error === null && matched !== null;
};

exports.parseCalc = function parseCalc(val, opt = { format: "specifiedValue" }) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  if (val === "" || exports.hasVarFunc(val) || !exports.hasCalcFunc(val)) {
    return val;
  }
  const obj = exports.parseCSS(val, { context: "value" }, true);
  if (!obj?.children) {
    return;
  }
  const { children: items } = obj;
  const values = [];
  for (const item of items) {
    const { type: itemType, name: itemName, value: itemValue } = item;
    if (itemType === "Function") {
      const value = cssTree
        .generate(item)
        .replace(/\)(?!\)|\s|,)/g, ") ")
        .trim();
      if (calcNameRegEx.test(itemName)) {
        const newValue = cssCalc(value, opt);
        values.push(newValue);
      } else {
        values.push(value);
      }
    } else if (itemType === "String") {
      values.push(`"${itemValue}"`);
    } else {
      values.push(itemName ?? itemValue);
    }
  }
  return values.join(" ");
};

exports.parseFunction = function parseFunction(val) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  if (val === "") {
    return {
      name: null,
      value: "",
      hasVar: false,
      raw: ""
    };
  }
  const obj = exports.parseCSS(val, { context: "value" }, true);
  if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
    return;
  }
  const [{ name, type }] = obj.children;
  if (type !== "Function") {
    return;
  }
  const value = val
    .replace(new RegExp(`^${name}\\(`), "")
    .replace(/\)$/, "")
    .trim();
  return {
    name,
    value,
    hasVar: exports.hasVarFunc(val),
    raw: val
  };
};

exports.parseNumber = function parseNumber(val, opt = {}) {
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    } else if (exports.hasCalcFunc(val)) {
      return exports.parseCalc(val, {
        format: "specifiedValue"
      });
    }
    const obj = exports.parseCSS(val, { context: "value" }, true);
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value } = item ?? {};
  if (type !== "Number") {
    return;
  }
  let num = parseFloat(value);
  if (clamp) {
    if (num > max) {
      num = max;
    } else if (num < min) {
      num = min;
    }
  } else if (num > max || num < min) {
    return;
  }
  return `${num}`;
};

exports.parseLength = function parseLength(val, opt = {}) {
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    } else if (exports.hasCalcFunc(val)) {
      return exports.parseCalc(val, {
        format: "specifiedValue"
      });
    }
    const obj = exports.parseCSS(val, { context: "value" }, true);
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value, unit } = item ?? {};
  if (type !== "Dimension" && !(type === "Number" && value === "0")) {
    return;
  }
  let num = parseFloat(value);
  if (clamp) {
    if (num > max) {
      num = max;
    } else if (num < min) {
      num = min;
    }
  } else if (num > max || num < min) {
    return;
  }
  if (num === 0 && !unit) {
    return `${num}px`;
  } else if (unit) {
    return `${num}${asciiLowercase(unit)}`;
  }
};

exports.parsePercent = function parsePercent(val, opt = {}) {
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    } else if (exports.hasCalcFunc(val)) {
      return exports.parseCalc(val, {
        format: "specifiedValue"
      });
    }
    const obj = exports.parseCSS(val, { context: "value" }, true);
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value } = item ?? {};
  if (type !== "Percentage" && !(type === "Number" && value === "0")) {
    return;
  }
  let num = parseFloat(value);
  if (clamp) {
    if (num > max) {
      num = max;
    } else if (num < min) {
      num = min;
    }
  } else if (num > max || num < min) {
    return;
  }
  if (num === 0) {
    return `${num}%`;
  }
  return `${num}%`;
};

// Either a length or a percent.
exports.parseMeasurement = function parseMeasurement(val, opt = {}) {
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    } else if (exports.hasCalcFunc(val)) {
      return exports.parseCalc(val, {
        format: "specifiedValue"
      });
    }
    const obj = exports.parseCSS(val, { context: "value" }, true);
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value, unit } = item ?? {};
  if (type !== "Dimension" && type !== "Percentage" && !(type === "Number" && value === "0")) {
    return;
  }
  let num = parseFloat(value);
  if (clamp) {
    if (num > max) {
      num = max;
    } else if (num < min) {
      num = min;
    }
  } else if (num > max || num < min) {
    return;
  }
  if (unit) {
    return `${num}${asciiLowercase(unit)}`;
  } else if (type === "Percentage") {
    return `${num}%`;
  } else if (num === 0) {
    return `${num}px`;
  }
};

exports.parseAngle = function parseAngle(val) {
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    } else if (exports.hasCalcFunc(val)) {
      return exports.parseCalc(val, {
        format: "specifiedValue"
      });
    }
    const obj = exports.parseCSS(val, { context: "value" }, true);
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value, unit } = item ?? {};
  if (type !== "Dimension" && !(type === "Number" && value === "0")) {
    return;
  }
  const num = parseFloat(value);
  if (unit) {
    return `${num}${asciiLowercase(unit)}`;
  } else if (num === 0) {
    return `${num}deg`;
  }
};

exports.parseUrl = function parseUrl(val) {
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "") {
      return val;
    }
    let obj;
    try {
      obj = exports.parseCSS(val, { context: "value" }, true);
    } catch {
      return;
    }
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value } = item ?? {};
  if (type !== "Url") {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `url("${str}")`;
};

exports.parseString = function parseString(val) {
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "") {
      return val;
    }
    let obj;
    try {
      obj = exports.parseCSS(val, { context: "value" }, true);
    } catch {
      return;
    }
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { type, value } = item ?? {};
  if (type !== "String") {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `"${str}"`;
};

exports.parseKeyword = function parseKeyword(val, validKeywords = []) {
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "") {
      return val;
    }
    let obj;
    try {
      obj = exports.parseCSS(val, { context: "value" }, true);
    } catch {
      return;
    }
    if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
      return;
    }
    items.push(...obj.children);
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { name, type } = item ?? {};
  if (type !== "Identifier" || name === "undefined") {
    return;
  }
  const value = asciiLowercase(name);
  if (validKeywords.includes(value) || GLOBAL_KEY.includes(value)) {
    return value;
  }
};

exports.parseColor = function parseColor(val) {
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    }
    if (/^[a-z]+$/i.test(val)) {
      const v = asciiLowercase(val);
      if (SYS_COLOR.includes(v)) {
        return v;
      }
    }
    items.push({
      type: "Function",
      raw: val
    });
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { name, raw, type, value } = item;
  switch (type) {
    case "Function": {
      const res = resolveColor(raw, {
        format: "specifiedValue"
      });
      if (res) {
        return res;
      }
      break;
    }
    case "Hash": {
      const res = resolveColor(`#${value}`, {
        format: "specifiedValue"
      });
      if (res) {
        return res;
      }
      break;
    }
    case "Identifier": {
      const res = resolveColor(name, {
        format: "specifiedValue"
      });
      if (res) {
        return res;
      }
      break;
    }
    default:
  }
};

exports.parseImage = function parseImage(val) {
  const items = [];
  if (Array.isArray(val)) {
    items.push(...val);
  } else {
    if (typeof val !== "string") {
      val = exports.prepareValue(val);
    }
    if (val === "" || exports.hasVarFunc(val)) {
      return val;
    }
    const func = exports.parseFunction(val);
    const url = exports.parseUrl(val);
    if (func) {
      func.type = "Function";
      items.push(func);
    } else if (url) {
      items.push({
        type: "Url",
        value: url.replace(/^url\("/, "").replace(/"\)$/, "")
      });
    }
  }
  if (!items.length) {
    return;
  }
  const [item] = items;
  const { name, raw, type } = item ?? {};
  switch (type) {
    case "Function": {
      const res = resolveGradient(raw, {
        format: "specifiedValue"
      });
      if (res) {
        return res;
      }
      break;
    }
    case "Identifier": {
      return name;
    }
    case "Url": {
      return exports.parseUrl(items);
    }
    default:
  }
};

exports.parseShorthand = function parseShorthand(val, shorthandFor, opt = {}) {
  const { globalObject, preserve } = opt;
  if (typeof val !== "string") {
    val = exports.prepareValue(val, globalObject);
  }
  const obj = {};
  if (val === "" || exports.hasVarFunc(val)) {
    for (const [property] of shorthandFor) {
      obj[property] = "";
    }
    return obj;
  }
  const value = asciiLowercase(val);
  if (GLOBAL_KEY.includes(value)) {
    for (const [property] of shorthandFor) {
      obj[property] = value;
    }
    return obj;
  }
  const parts = splitValue(value);
  const longhands = [...shorthandFor];
  for (let part of parts) {
    if (exports.hasCalcFunc(part)) {
      const parsedValue = exports.parseCalc(part);
      part = parsedValue;
    }
    let partValid = false;
    for (let i = 0; i < longhands.length; i++) {
      const [property, longhand] = longhands[i];
      if (exports.isValidPropertyValue(property, part)) {
        partValid = true;
        obj[property] = longhand.parse(part, opt);
        if (!preserve) {
          longhands.splice(i, 1);
          break;
        }
      }
    }
    if (!partValid) {
      return;
    }
  }
  return obj;
};

// Parse property value. Returns string or array of parsed object.
exports.parsePropertyValue = function parsePropertyValue(prop, val, opt = {}) {
  const { caseSensitive, globalObject, inArray } = opt;
  val = exports.prepareValue(val, globalObject);
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  } else if (exports.hasCalcFunc(val)) {
    const parsedValue = exports.parseCalc(val, {
      format: "specifiedValue"
    });
    if (typeof parsedValue !== "string") {
      return;
    }
    val = parsedValue;
  }
  let value = val;
  if (!caseSensitive) {
    value = asciiLowercase(val);
  }
  if (GLOBAL_KEY.includes(value)) {
    if (inArray) {
      return [
        {
          type: "GlobalKeyword",
          name: value
        }
      ];
    }
    return value;
  } else if (SYS_COLOR.includes(value)) {
    if (/^(?:-webkit-)?(?:[a-z][a-z\d]*-)*color$/i.test(prop)) {
      return value;
    }
    return;
  }
  try {
    const ast = exports.parseCSS(value, {
      context: "value"
    });
    const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
    if (error || !matched) {
      return;
    }
    if (inArray) {
      const obj = cssTree.toPlainObject(ast);
      const items = obj.children;
      if (items.length === 1) {
        const [{ children, name, type }] = items;
        if (type === "Function") {
          const itemValue = value
            .replace(new RegExp(`^${name}\\(`), "")
            .replace(/\)$/, "")
            .trim();
          if (name === "calc") {
            if (children.length === 1) {
              const [child] = children;
              if (child.type === "Number") {
                return [
                  {
                    type: "Calc",
                    name: "calc",
                    isNumber: true,
                    value: `${parseFloat(child.value)}`,
                    raw: val
                  }
                ];
              }
            }
            return [
              {
                type: "Calc",
                name: "calc",
                isNumber: false,
                value: itemValue,
                raw: val
              }
            ];
          }
          return [
            {
              type,
              name,
              value: itemValue,
              raw: val
            }
          ];
        }
      } else if (items.length > 1) {
        const arr = [];
        for (const item of items) {
          const { children, name, type } = item;
          if (type === "Function") {
            const raw = cssTree
              .generate(item)
              .replace(/\)(?!\)|\s|,)/g, ") ")
              .trim();
            const itemValue = raw
              .replace(new RegExp(`^${name}\\(`), "")
              .replace(/\)$/, "")
              .trim();
            if (name === "calc") {
              if (children.length === 1) {
                const [child] = children;
                if (child.type === "Number") {
                  arr.push({
                    type: "Calc",
                    name: "calc",
                    isNumber: true,
                    value: `${parseFloat(child.value)}`,
                    raw
                  });
                }
              } else {
                arr.push({
                  type: "Calc",
                  name: "calc",
                  isNumber: false,
                  value: itemValue,
                  raw
                });
              }
            } else {
              arr.push({
                type,
                name,
                raw,
                value: itemValue
              });
            }
          } else {
            arr.push(item);
          }
        }
        return arr;
      }
      return items;
    }
  } catch {
    return;
  }
  return value;
};
