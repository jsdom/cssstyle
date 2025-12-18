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
const GLOBAL_KEYS = new Set(["initial", "inherit", "unset", "revert", "revert-layer"]);

// System colors
// @see https://drafts.csswg.org/css-color/#css-system-colors
// @see https://drafts.csswg.org/css-color/#deprecated-system-colors
const SYS_COLORS = new Set([
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

// AST node types
// TODO: Export and use in properties/*.js in the future
const AST_TYPES = Object.freeze({
  CALC: "Calc",
  DIMENSION: "Dimension",
  FUNCTION: "Function",
  GLOBAL_KEYWORD: "GlobalKeyword",
  HASH: "Hash",
  IDENTIFIER: "Identifier",
  NUMBER: "Number",
  PERCENTAGE: "Percentage",
  STRING: "String",
  URL: "Url"
});

// Regular expressions
const CALC_FUNC_NAMES =
  "(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)";
const calcRegEx = new RegExp(`^${CALC_FUNC_NAMES}\\(`);
const calcContainedRegEx = new RegExp(`(?<=[*/\\s(])${CALC_FUNC_NAMES}\\(`);
const calcNameRegEx = new RegExp(`^${CALC_FUNC_NAMES}$`);
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;

// Patched css-tree
const cssTree = csstree.fork(syntaxes);

/**
 * Prepares a stringified value.
 *
 * @param {string|number|null|undefined} value - The value to prepare.
 * @param {object} [globalObject=globalThis] - The global object.
 * @returns {string} The prepared value.
 */
const prepareValue = (value, globalObject = globalThis) => {
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

/**
 * Checks if the value is a global keyword.
 *
 * @param {string} val - The value to check.
 * @returns {boolean} True if the value is a global keyword, false otherwise.
 */
const isGlobalKeyword = (val) => {
  return GLOBAL_KEYS.has(asciiLowercase(val));
};

/**
 * Checks if the value starts with or contains a CSS var() function.
 *
 * @param {string} val - The value to check.
 * @returns {boolean} True if the value contains a var() function, false otherwise.
 */
const hasVarFunc = (val) => {
  return varRegEx.test(val) || varContainedRegEx.test(val);
};

/**
 * Checks if the value starts with or contains CSS calc() or math functions.
 *
 * @param {string} val - The value to check.
 * @returns {boolean} True if the value contains calc() or math functions, false otherwise.
 */
const hasCalcFunc = (val) => {
  return calcRegEx.test(val) || calcContainedRegEx.test(val);
};

/**
 * Parses a CSS string into an AST.
 *
 * @param {string} val - The CSS string to parse.
 * @param {object} opt - The options for parsing.
 * @param {boolean} [toObject=false] - Whether to return a plain object.
 * @returns {object} The AST or a plain object.
 */
const parseCSS = (val, opt, toObject = false) => {
  if (typeof val !== "string") {
    val = prepareValue(val);
  }
  const ast = cssTree.parse(val, opt);
  if (toObject) {
    return cssTree.toPlainObject(ast);
  }
  return ast;
};

/**
 * Checks if the value is a valid property value.
 * Returns false for custom properties or values containing var().
 *
 * @param {string} prop - The property name.
 * @param {string} val - The property value.
 * @returns {boolean} True if the value is valid, false otherwise.
 */
const isValidPropertyValue = (prop, val) => {
  if (typeof val !== "string") {
    val = prepareValue(val);
  }
  if (val === "") {
    return true;
  }
  // cssTree.lexer does not support deprecated system colors
  // @see https://github.com/w3c/webref/issues/1519#issuecomment-3120290261
  // @see https://github.com/w3c/webref/issues/1647
  if (SYS_COLORS.has(asciiLowercase(val))) {
    if (/^(?:-webkit-)?(?:[a-z][a-z\d]*-)*color$/i.test(prop)) {
      return true;
    }
    return false;
  }
  let ast;
  try {
    ast = parseCSS(val, {
      context: "value"
    });
  } catch {
    return false;
  }
  const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
  return error === null && matched !== null;
};

/**
 * Resolves CSS math functions.
 *
 * @param {string} val - The value to resolve.
 * @param {object} [opt={ format: "specifiedValue" }] - The options for resolving.
 * @returns {string|undefined} The resolved value.
 */
const resolveCalc = (val, opt = { format: "specifiedValue" }) => {
  if (typeof val !== "string") {
    val = prepareValue(val);
  }
  if (val === "" || hasVarFunc(val) || !hasCalcFunc(val)) {
    return val;
  }
  const obj = parseCSS(val, { context: "value" }, true);
  if (!obj?.children) {
    return;
  }
  const { children: items } = obj;
  const values = [];
  for (const item of items) {
    const { type: itemType, name: itemName, value: itemValue } = item;
    if (itemType === AST_TYPES.FUNCTION) {
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
    } else if (itemType === AST_TYPES.STRING) {
      values.push(`"${itemValue}"`);
    } else {
      values.push(itemName ?? itemValue);
    }
  }
  return values.join(" ");
};

/**
 * Parses a property value.
 * Returns a string or an array of parsed objects.
 *
 * @param {string} prop - The property name.
 * @param {string} val - The property value.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|Array<object>|undefined} The parsed value.
 */
const parsePropertyValue = (prop, val, opt = {}) => {
  const { caseSensitive, globalObject, inArray } = opt;
  val = prepareValue(val, globalObject);
  if (val === "" || hasVarFunc(val)) {
    return val;
  } else if (hasCalcFunc(val)) {
    const calculatedValue = resolveCalc(val, {
      format: "specifiedValue"
    });
    if (typeof calculatedValue !== "string") {
      return;
    }
    val = calculatedValue;
  }
  const lowerCasedValue = asciiLowercase(val);
  if (GLOBAL_KEYS.has(lowerCasedValue)) {
    if (inArray) {
      return [
        {
          type: AST_TYPES.GLOBAL_KEYWORD,
          name: lowerCasedValue
        }
      ];
    }
    return lowerCasedValue;
  } else if (SYS_COLORS.has(lowerCasedValue)) {
    if (/^(?:(?:-webkit-)?(?:[a-z][a-z\d]*-)*color|border)$/i.test(prop)) {
      if (inArray) {
        return [
          {
            type: AST_TYPES.IDENTIFIER,
            name: lowerCasedValue
          }
        ];
      }
      return lowerCasedValue;
    }
    return;
  }
  try {
    const ast = parseCSS(val, {
      context: "value"
    });
    const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
    if (error || !matched) {
      return;
    }
    if (inArray) {
      const obj = cssTree.toPlainObject(ast);
      const items = obj.children;
      const parsedValues = [];
      for (const item of items) {
        const { children, name, type, value, unit } = item;
        switch (type) {
          case AST_TYPES.DIMENSION: {
            parsedValues.push({
              type,
              value,
              unit: asciiLowercase(unit)
            });
            break;
          }
          case AST_TYPES.FUNCTION: {
            const css = cssTree
              .generate(item)
              .replace(/\)(?!\)|\s|,)/g, ") ")
              .trim();
            const raw = items.length === 1 ? val : css;
            // Remove "${name}(" from the start and ")" from the end
            const itemValue = raw.slice(name.length + 1, -1).trim();

            if (name === "calc") {
              if (children.length === 1) {
                const [child] = children;
                if (child.type === AST_TYPES.NUMBER) {
                  parsedValues.push({
                    type: AST_TYPES.CALC,
                    name: "calc",
                    isNumber: true,
                    value: `${parseFloat(child.value)}`,
                    raw
                  });
                } else {
                  parsedValues.push({
                    type: AST_TYPES.CALC,
                    name: "calc",
                    isNumber: false,
                    value: `${asciiLowercase(itemValue)}`,
                    raw
                  });
                }
              } else {
                parsedValues.push({
                  type: AST_TYPES.CALC,
                  name: "calc",
                  isNumber: false,
                  value: asciiLowercase(itemValue),
                  raw
                });
              }
            } else {
              parsedValues.push({
                type,
                name,
                value: asciiLowercase(itemValue),
                raw
              });
            }
            break;
          }
          case AST_TYPES.IDENTIFIER: {
            if (caseSensitive) {
              parsedValues.push(item);
            } else {
              parsedValues.push({
                type,
                name: asciiLowercase(name)
              });
            }
            break;
          }
          default: {
            parsedValues.push(item);
          }
        }
      }
      return parsedValues;
    }
  } catch {
    return;
  }
  return val;
};

/**
 * Parses a <number> value.
 *
 * @param {Array<object>} val - The AST value.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} The parsed number.
 */
const parseNumber = (val, opt = {}) => {
  const [item] = val;
  const { type, value } = item ?? {};
  if (type !== AST_TYPES.NUMBER) {
    return;
  }
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
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

/**
 * Parses a <length> value.
 *
 * @param {Array<object>} val - The AST value.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} The parsed length.
 */
const parseLength = (val, opt = {}) => {
  const [item] = val;
  const { type, value, unit } = item ?? {};
  if (type !== AST_TYPES.DIMENSION && !(type === AST_TYPES.NUMBER && value === "0")) {
    return;
  }
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
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

/**
 * Parses a <percentage> value.
 *
 * @param {Array<object>} val - The AST value.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} The parsed percentage.
 */
const parsePercentage = (val, opt = {}) => {
  const [item] = val;
  const { type, value } = item ?? {};
  if (type !== AST_TYPES.PERCENTAGE && !(type === AST_TYPES.NUMBER && value === "0")) {
    return;
  }
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
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

/**
 * Parses a <length-percentage> value.
 *
 * @param {Array<object>} val - The AST value.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} The parsed length-percentage.
 */
const parseLengthPercentage = (val, opt = {}) => {
  const [item] = val;
  const { type, value, unit } = item ?? {};
  if (
    type !== AST_TYPES.DIMENSION &&
    type !== AST_TYPES.PERCENTAGE &&
    !(type === AST_TYPES.NUMBER && value === "0")
  ) {
    return;
  }
  const { clamp } = opt;
  const max = opt.max ?? Number.INFINITY;
  const min = opt.min ?? Number.NEGATIVE_INFINITY;
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
    if (/deg|g?rad|turn/i.test(unit)) {
      return;
    }
    return `${num}${asciiLowercase(unit)}`;
  } else if (type === AST_TYPES.PERCENTAGE) {
    return `${num}%`;
  } else if (num === 0) {
    return `${num}px`;
  }
};

/**
 * Parses an <angle> value.
 *
 * @param {Array<object>} val - The AST value.
 * @returns {string|undefined} The parsed angle.
 */
const parseAngle = (val) => {
  const [item] = val;
  const { type, value, unit } = item ?? {};
  if (type !== AST_TYPES.DIMENSION && !(type === AST_TYPES.NUMBER && value === "0")) {
    return;
  }
  const num = parseFloat(value);
  if (unit) {
    if (!/^(?:deg|g?rad|turn)$/i.test(unit)) {
      return;
    }
    return `${num}${asciiLowercase(unit)}`;
  } else if (num === 0) {
    return `${num}deg`;
  }
};

/**
 * Parses a <url> value.
 *
 * @param {Array<object>} val - The AST value.
 * @returns {string|undefined} The parsed url.
 */
const parseUrl = (val) => {
  const [item] = val;
  const { type, value } = item ?? {};
  if (type !== AST_TYPES.URL) {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `url("${str}")`;
};

/**
 * Parses a <string> value.
 *
 * @param {Array<object>} val - The AST value.
 * @returns {string|undefined} The parsed string.
 */
const parseString = (val) => {
  const [item] = val;
  const { type, value } = item ?? {};
  if (type !== AST_TYPES.STRING) {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `"${str}"`;
};

/**
 * Parses a <color> value.
 *
 * @param {Array<object>} val - The AST value.
 * @returns {string|undefined} The parsed color.
 */
const parseColor = (val) => {
  const [item] = val;
  const { name, type, value } = item ?? {};
  switch (type) {
    case AST_TYPES.FUNCTION: {
      const res = resolveColor(`${name}(${value})`, {
        format: "specifiedValue"
      });
      if (res) {
        return res;
      }
      break;
    }
    case AST_TYPES.HASH: {
      const res = resolveColor(`#${value}`, {
        format: "specifiedValue"
      });
      if (res) {
        return res;
      }
      break;
    }
    case AST_TYPES.IDENTIFIER: {
      if (SYS_COLORS.has(name)) {
        return name;
      }
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

/**
 * Parses a <gradient> value.
 *
 * @param {Array<object>} val - The AST value.
 * @returns {string|undefined} The parsed gradient.
 */
const parseGradient = (val) => {
  const [item] = val;
  const { name, type, value } = item ?? {};
  if (type !== AST_TYPES.FUNCTION) {
    return;
  }
  const res = resolveGradient(`${name}(${value})`, {
    format: "specifiedValue"
  });
  if (res) {
    return res;
  }
};

module.exports = {
  prepareValue,
  isGlobalKeyword,
  hasVarFunc,
  hasCalcFunc,
  splitValue,
  parseCSS,
  isValidPropertyValue,
  resolveCalc,
  parsePropertyValue,
  parseNumber,
  parseLength,
  parsePercentage,
  parseLengthPercentage,
  parseAngle,
  parseUrl,
  parseString,
  parseColor,
  parseGradient
};
