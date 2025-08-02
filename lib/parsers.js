"use strict";

const {
  resolve: resolveColor,
  utils: { cssCalc, resolveGradient, splitValue }
} = require("@asamuzakjp/css-color");
const { next: syntaxes } = require("@csstools/css-syntax-patches-for-csstree");
const csstree = require("css-tree");
const { asciiLowercase } = require("./utils/strings");

// CSS global values
// @see https://drafts.csswg.org/css-cascade-5/#defaulting-keywords
const GLOBAL_VALUE = Object.freeze(["initial", "inherit", "unset", "revert", "revert-layer"]);

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
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;
const calcRegEx = new RegExp(`^${CALC_FUNC_NAMES}\\(`);
const calcContainedRegEx = new RegExp(`(?<=[*/\\s(])${CALC_FUNC_NAMES}\\(`);
const calcNameRegEx = new RegExp(`^${CALC_FUNC_NAMES}$`);

// Patch css-tree.
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
        return str;
      }
      throw new globalObject.TypeError(`Can not convert ${type} to string.`);
    }
  }
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
      value: ""
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
  if (/^var$/.test(name) || exports.hasVarFunc(val)) {
    return {
      name: "var",
      value: val
    };
  }
  const value = val
    .replace(new RegExp(`^${name}\\(`), "")
    .replace(/\)$/, "")
    .trim();
  return {
    name,
    value
  };
};

exports.parseNumber = function parseNumber(val, restrictToPositive = false) {
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
  const [{ type, value }] = obj.children;
  if (type !== "Number") {
    return;
  }
  const num = parseFloat(value);
  if (restrictToPositive && num < 0) {
    return;
  }
  return `${num}`;
};

exports.parseLength = function parseLength(val, restrictToPositive = false) {
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
  const [{ type, unit, value }] = obj.children;
  if (type !== "Dimension" && type !== "Number") {
    return;
  }
  const num = parseFloat(value);
  if (restrictToPositive && num < 0) {
    return;
  }
  if (num === 0 && !unit) {
    return `${num}px`;
  } else if (unit) {
    return `${num}${asciiLowercase(unit)}`;
  }
};

exports.parsePercent = function parsePercent(val, restrictToPositive = false) {
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
  const [{ type, value }] = obj.children;
  if (type !== "Percentage" && type !== "Number") {
    return;
  }
  const num = parseFloat(value);
  if (restrictToPositive && num < 0) {
    return;
  }
  if (num === 0) {
    return `${num}%`;
  }
  return `${num}%`;
};

// Either a length or a percent.
exports.parseMeasurement = function parseMeasurement(val, restrictToPositive = false) {
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
  const [{ type, unit, value }] = obj.children;
  if (type !== "Dimension" && type !== "Number" && type !== "Percentage") {
    return;
  }
  const num = parseFloat(value);
  if (restrictToPositive && num < 0) {
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

exports.parseAngle = function parseAngle(val, normalizeDeg = false) {
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
  const [{ type, unit, value }] = obj.children;
  if (type !== "Dimension" && type !== "Number") {
    return;
  }
  let num = parseFloat(value);
  if (unit) {
    const angle = asciiLowercase(unit);
    if (angle === "deg") {
      if (normalizeDeg && num < 0) {
        while (num < 0) {
          num += 360;
        }
      }
      num %= 360;
    }
    return `${num}${angle}`;
  } else if (num === 0) {
    return `${num}deg`;
  }
};

exports.parseUrl = function parseUrl(val) {
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
  const [{ type, value }] = obj.children;
  if (type !== "Url") {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `url("${str}")`;
};

exports.parseString = function parseString(val) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  if (val === "") {
    return "";
  }
  const obj = exports.parseCSS(val, { context: "value" }, true);
  if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
    return;
  }
  const [{ type, value }] = obj.children;
  if (type !== "String") {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `"${str}"`;
};

exports.parseKeyword = function parseKeyword(val, validKeywords = []) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  if (val === "" || varRegEx.test(val)) {
    return val;
  }
  const obj = exports.parseCSS(val, { context: "value" }, true);
  if (!obj || !Array.isArray(obj.children) || obj.children.length > 1) {
    return;
  }
  const [{ name, type }] = obj.children;
  if (type !== "Identifier" || name === "undefined") {
    return;
  }
  const value = asciiLowercase(name);
  if (validKeywords.includes(value) || GLOBAL_VALUE.includes(value)) {
    return value;
  }
};

exports.parseColor = function parseColor(val) {
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
  const res = resolveColor(val, {
    format: "specifiedValue"
  });
  if (res) {
    return res;
  }
};

exports.parseImage = function parseImage(val) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  }
  const res = resolveGradient(val, {
    format: "specifiedValue"
  });
  if (res) {
    return res;
  }
  return exports.parseUrl(val);
};

exports.parseShorthand = function parseShorthand(val, shorthandFor, preserve = false) {
  if (typeof val !== "string") {
    val = exports.prepareValue(val);
  }
  const obj = {};
  if (val === "" || exports.hasVarFunc(val)) {
    for (const [property] of shorthandFor) {
      obj[property] = "";
    }
    return obj;
  }
  const key = exports.parseKeyword(val);
  if (key) {
    if (key === "inherit") {
      return obj;
    }
    return;
  }
  const parts = splitValue(val);
  const shorthandArr = [...shorthandFor];
  for (let part of parts) {
    if (exports.hasCalcFunc(part)) {
      part = exports.parseCalc(part);
    }
    let partValid = false;
    for (let i = 0; i < shorthandArr.length; i++) {
      const [property, value] = shorthandArr[i];
      if (exports.isValidPropertyValue(property, part)) {
        partValid = true;
        obj[property] = value.parse(part);
        if (!preserve) {
          shorthandArr.splice(i, 1);
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
