"use strict";

const {
  resolve: resolveColor,
  utils: { cssCalc, resolveGradient, splitValue }
} = require("@asamuzakjp/css-color");
const { next: syntaxes } = require("@csstools/css-syntax-patches-for-csstree");
const csstree = require("css-tree");
const { getCache, setCache } = require("./utils/cache");
const { asciiLowercase } = require("./utils/strings");
const { CALC_FUNC_NAMES, GLOBAL_KEY, NODE_TYPES, SYS_COLOR } = require("./utils/constants");

// Regular expressions
const calcRegEx = new RegExp(`^${CALC_FUNC_NAMES}\\(`);
const calcContainedRegEx = new RegExp(`(?<=[*/\\s(])${CALC_FUNC_NAMES}\\(`);
const calcNameRegEx = new RegExp(`^${CALC_FUNC_NAMES}$`);
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;

// Patched css-tree
const cssTree = csstree.fork(syntaxes);

/**
 * Prepare stringified value.
 *
 * @param {string|number|null|undefined} value - The value to stringify.
 * @param {object} [globalObject=globalThis] - The global object.
 * @returns {string} - The stringified value.
 * @throws {TypeError} - If the value type cannot be converted to a string.
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
 * Check if the value is a global keyword.
 *
 * @param {string} val - The value to check.
 * @returns {boolean} - True if the value is a global keyword, false otherwise.
 */
const isGlobalKeyword = (val) => {
  return GLOBAL_KEY.includes(asciiLowercase(val));
};

/**
 * Check if the value starts with and/or contains CSS var() function.
 *
 * @param {string} val - The value to check.
 * @returns {boolean} - True if the value contains var(), false otherwise.
 */
const hasVarFunc = (val) => {
  return varRegEx.test(val) || varContainedRegEx.test(val);
};

/**
 * Check if the value starts with and/or contains CSS calc() related functions.
 *
 * @param {string} val - The value to check.
 * @returns {boolean} - True if the value contains calc() related functions, false otherwise.
 */
const hasCalcFunc = (val) => {
  return calcRegEx.test(val) || calcContainedRegEx.test(val);
};

/**
 * Parse CSS to AST or plain object.
 *
 * @param {string} val - The CSS string to parse.
 * @param {object} [opt={}] - The options for parsing.
 * @param {boolean} [toObject=false] - Whether to return a plain object instead of AST.
 * @returns {object} - The parsed AST or plain object.
 */
const parseCSS = (val, opt = {}, toObject = false) => {
  const { globalObject, options } = opt;
  if (typeof val !== "string") {
    val = prepareValue(val, globalObject);
  }
  const ast = cssTree.parse(val, options);
  if (toObject) {
    return cssTree.toPlainObject(ast);
  }
  return ast;
};

/**
 * Check if the value is a valid property value.
 * Returns `false` for custom property and/or var().
 *
 * @param {string} prop - The property name.
 * @param {string} val - The property value.
 * @param {object} globalObject - The global object.
 * @returns {boolean} - True if the value is valid for the property, false otherwise.
 */
const isValidPropertyValue = (prop, val, globalObject) => {
  if (typeof val !== "string") {
    val = prepareValue(val, globalObject);
  }
  if (val === "") {
    return true;
  }
  // cssTree.lexer does not support deprecated system colors
  // @see https://github.com/w3c/webref/issues/1519#issuecomment-3120290261
  // @see https://github.com/w3c/webref/issues/1647
  if (SYS_COLOR.includes(asciiLowercase(val))) {
    if (/^(?:-webkit-)?(?:[a-z][a-z\d]*-)*color$/i.test(prop)) {
      return true;
    }
    return false;
  }

  // Use cache for expensive parsing
  const cacheKey = `isValidPropertyValue_${prop}_${val}`;
  const cachedValue = getCache(cacheKey);
  if (typeof cachedValue === "boolean") {
    return cachedValue;
  }

  let ast;
  try {
    ast = parseCSS(val, {
      globalObject,
      options: {
        context: "value"
      }
    });
  } catch {
    setCache(cacheKey, false);
    return false;
  }
  const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
  const result = error === null && matched !== null;
  setCache(cacheKey, result);
  return result;
};

const defaultOptions = {
  format: "specifiedValue"
};

/**
 * Process numeric value.
 *
 * @param {object} item - The AST node item.
 * @param {Array<string>} allowedTypes - The allowed AST node types.
 * @param {object} [opt={}] - The options for processing.
 * @returns {number|undefined} - The processed number, or undefined if invalid.
 */
const processNumericValue = (item, allowedTypes, opt = {}) => {
  const { type, value } = item ?? {};

  // Allow "Number" with value "0" if "Dimension" or "Percentage" is allowed.
  const isZero = type === NODE_TYPES.NUMBER && parseFloat(value) === 0;
  const isValidType =
    allowedTypes.includes(type) ||
    (isZero &&
      (allowedTypes.includes(NODE_TYPES.DIMENSION) ||
        allowedTypes.includes(NODE_TYPES.PERCENTAGE)));

  if (!isValidType) {
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

  return num;
};

/**
 * Simplify / resolve math functions.
 *
 * @param {string} val - The value to resolve.
 * @param {object} [opt={}] - The options for resolution.
 * @returns {string|undefined} - The resolved value, or undefined if parsing failed.
 */
const resolveCalc = (val, opt = {}) => {
  const { globalObject, options } = opt;
  if (typeof val !== "string") {
    val = prepareValue(val, globalObject);
  }
  if (val === "" || hasVarFunc(val) || !hasCalcFunc(val)) {
    return val;
  }

  // Use cache for expensive calculation
  const cacheKey = `resolveCalc_${val}`;
  const cachedValue = getCache(cacheKey);
  if (typeof cachedValue === "string") {
    return cachedValue;
  }

  const obj = parseCSS(
    val,
    {
      globalObject,
      options: {
        context: "value"
      }
    },
    true
  );
  if (!obj?.children) {
    return;
  }
  const { children: items } = obj;
  const values = [];
  for (const item of items) {
    const { type: itemType, name: itemName, value: itemValue } = item;
    if (itemType === NODE_TYPES.FUNCTION) {
      const value = cssTree
        .generate(item)
        .replace(/\)(?!\)|\s|,)/g, ") ")
        .replace(/,(?!\s)/g, ", ")
        .trim();
      if (calcNameRegEx.test(itemName)) {
        const newValue = cssCalc(value, options ?? defaultOptions);
        values.push(newValue);
      } else {
        values.push(value);
      }
    } else if (itemType === NODE_TYPES.STRING) {
      values.push(`"${itemValue}"`);
    } else {
      values.push(itemName ?? itemValue);
    }
  }
  const result = values.join(" ");
  setCache(cacheKey, result);
  return result;
};

/**
 * Create a normalized calc node object.
 *
 * @param {Array} children - The AST children of the calc function.
 * @param {string} value - The normalized string value of the calc function content.
 * @param {string} raw - The raw string representation.
 * @returns {object} - The normalized calc node object.
 */
const createCalcNode = (children, value, raw) => {
  let isNumber = false;
  let nodeValue = value;

  // calc(number) の場合のみ特別扱いして数値としてパースする
  if (children.length === 1) {
    const [child] = children;
    if (child.type === NODE_TYPES.NUMBER) {
      isNumber = true;
      nodeValue = `${parseFloat(child.value)}`;
    }
  }

  return {
    type: "Calc",
    name: "calc",
    isNumber,
    value: nodeValue,
    raw
  };
};

/**
 * Normalize AST children nodes.
 *
 * @param {Array} items - The AST children nodes.
 * @param {string} val - The original value string.
 * @param {boolean} caseSensitive - Whether the value is case sensitive.
 * @returns {Array} - The normalized AST nodes.
 */
const normalizeAstNodes = (items, val, caseSensitive) => {
  const parsedValues = [];
  for (const item of items) {
    const { children, name, type, value, unit } = item;
    switch (type) {
      case NODE_TYPES.DIMENSION: {
        parsedValues.push({
          type,
          value,
          unit: asciiLowercase(unit)
        });
        break;
      }
      case NODE_TYPES.FUNCTION: {
        const css = cssTree
          .generate(item)
          .replace(/\)(?!\)|\s|,)/g, ") ")
          .trim();
        const raw = items.length === 1 ? val : css;
        const itemValue = raw
          .replace(new RegExp(`^${name}\\(`), "")
          .replace(/\)$/, "")
          .trim();
        if (name === "calc") {
          parsedValues.push(createCalcNode(children, asciiLowercase(itemValue), raw));
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
      case NODE_TYPES.IDENTIFIER: {
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
};

/**
 * Parse property value. Returns string or array of parsed object.
 *
 * @param {string} prop - The property name.
 * @param {string} val - The property value.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|Array|undefined} - The parsed value(s).
 */
const parsePropertyValue = (prop, val, opt = {}) => {
  const { caseSensitive, globalObject, inArray } = opt;
  val = prepareValue(val, globalObject);
  if (val === "" || hasVarFunc(val)) {
    return val;
  } else if (hasCalcFunc(val)) {
    const calculatedValue = resolveCalc(val, opt);
    if (typeof calculatedValue !== "string") {
      return;
    }
    val = calculatedValue;
  }
  const lowerCasedValue = asciiLowercase(val);
  if (GLOBAL_KEY.includes(lowerCasedValue)) {
    if (inArray) {
      return [
        {
          type: "GlobalKeyword",
          name: lowerCasedValue
        }
      ];
    }
    return lowerCasedValue;
  } else if (SYS_COLOR.includes(lowerCasedValue)) {
    if (/^(?:(?:-webkit-)?(?:[a-z][a-z\d]*-)*color|border)$/i.test(prop)) {
      if (inArray) {
        return [
          {
            type: NODE_TYPES.IDENTIFIER,
            name: lowerCasedValue
          }
        ];
      }
      return lowerCasedValue;
    }
    return;
  }
  try {
    let cacheKey = "";
    if (inArray) {
      cacheKey = `parsePropertyValue_${prop}_${val}_${caseSensitive}`;
      const cachedValues = getCache(cacheKey);
      if (Array.isArray(cachedValues)) {
        return cachedValues;
      }
    }
    const ast = parseCSS(val, {
      globalObject,
      options: {
        context: "value"
      }
    });
    const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
    if (error || !matched) {
      return;
    }
    if (inArray) {
      const obj = cssTree.toPlainObject(ast);
      const parsedValues = normalizeAstNodes(obj.children, val, caseSensitive);
      if (cacheKey) {
        setCache(cacheKey, parsedValues);
      }
      return parsedValues;
    }
  } catch {
    return;
  }
  return val;
};

/**
 * Parse <number>.
 *
 * @param {Array} val - The parsed AST children.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} - The parsed number string, or undefined if parsing failed.
 */
const parseNumber = (val, opt = {}) => {
  const [item] = val;
  const num = processNumericValue(item, [NODE_TYPES.NUMBER], opt);
  if (typeof num === "number") {
    return `${num}`;
  }
};

/**
 * Parse <length>.
 *
 * @param {Array} val - The parsed AST children.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} - The parsed length string, or undefined if parsing failed.
 */
const parseLength = (val, opt = {}) => {
  const [item] = val;
  const num = processNumericValue(item, [NODE_TYPES.DIMENSION], opt);
  if (typeof num !== "number") {
    return;
  }
  const { unit } = item ?? {};
  if (num === 0 && !unit) {
    return `${num}px`;
  } else if (unit) {
    return `${num}${unit}`;
  }
};

/**
 * Parse <percentage>.
 *
 * @param {Array} val - The parsed AST children.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} - The parsed percentage string, or undefined if parsing failed.
 */
const parsePercentage = (val, opt = {}) => {
  const [item] = val;
  const num = processNumericValue(item, [NODE_TYPES.PERCENTAGE], opt);
  if (typeof num === "number") {
    return `${num}%`;
  }
};

/**
 * Parse <length-percentage>.
 *
 * @param {Array} val - The parsed AST children.
 * @param {object} [opt={}] - The options for parsing.
 * @returns {string|undefined} - The parsed string, or undefined if parsing failed.
 */
const parseLengthPercentage = (val, opt = {}) => {
  const [item] = val;
  const num = processNumericValue(item, [NODE_TYPES.DIMENSION, NODE_TYPES.PERCENTAGE], opt);
  if (typeof num !== "number") {
    return;
  }
  const { type, unit } = item ?? {};
  if (unit) {
    if (/deg|g?rad|turn/i.test(unit)) {
      return;
    }
    return `${num}${unit}`;
  } else if (type === NODE_TYPES.PERCENTAGE) {
    return `${num}%`;
  } else if (num === 0) {
    return `${num}px`;
  }
};

/**
 * Parse <angle>.
 *
 * @param {Array} val - The parsed AST children.
 * @returns {string|undefined} - The parsed angle string, or undefined if parsing failed.
 */
const parseAngle = (val) => {
  const [item] = val;
  // NOTE: parseAngle signature in source doesn't accept opt, but implementation
  // should ideally be consistent. For now, matching existing logic via helper without opts.
  const num = processNumericValue(item, [NODE_TYPES.DIMENSION]);
  if (typeof num !== "number") {
    return;
  }
  const { unit } = item ?? {};
  if (unit) {
    if (!/^(?:deg|g?rad|turn)$/i.test(unit)) {
      return;
    }
    return `${num}${unit}`;
  } else if (num === 0) {
    return `${num}deg`;
  }
};

/**
 * Parse <url>.
 *
 * @param {Array} val - The parsed AST children.
 * @returns {string|undefined} - The parsed URL string, or undefined if parsing failed.
 */
const parseURL = (val) => {
  const [item] = val;
  const { type, value } = item ?? {};
  if (type !== NODE_TYPES.URL) {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `url("${str}")`;
};

/**
 * Parse <string>.
 *
 * @param {Array} val - The parsed AST children.
 * @returns {string|undefined} - The parsed string, or undefined if parsing failed.
 */
const parseString = (val) => {
  const [item] = val;
  const { type, value } = item ?? {};
  if (type !== NODE_TYPES.STRING) {
    return;
  }
  const str = value.replace(/\\\\/g, "\\").replaceAll('"', '\\"');
  return `"${str}"`;
};

/**
 * Parse <color>.
 *
 * @param {Array} val - The parsed AST children.
 * @param {object} [opt=defaultOptions] - The options for parsing.
 * @returns {string|undefined} - The parsed color string, or undefined if parsing failed.
 */
const parseColor = (val, opt = defaultOptions) => {
  const [item] = val;
  const { name, type, value } = item ?? {};
  switch (type) {
    case NODE_TYPES.FUNCTION: {
      const res = resolveColor(`${name}(${value})`, opt);
      if (res) {
        return res;
      }
      break;
    }
    case NODE_TYPES.HASH: {
      const res = resolveColor(`#${value}`, opt);
      if (res) {
        return res;
      }
      break;
    }
    case NODE_TYPES.IDENTIFIER: {
      if (SYS_COLOR.includes(name)) {
        return name;
      }
      const res = resolveColor(name, opt);
      if (res) {
        return res;
      }
      break;
    }
    default:
  }
};

/**
 * Parse <gradient>.
 *
 * @param {Array} val - The parsed AST children.
 * @param {object} [opt=defaultOptions] - The options for parsing.
 * @returns {string|undefined} - The parsed gradient string, or undefined if parsing failed.
 */
const parseGradient = (val, opt = defaultOptions) => {
  const [item] = val;
  const { name, type, value } = item ?? {};
  if (type !== NODE_TYPES.FUNCTION) {
    return;
  }
  const res = resolveGradient(`${name}(${value})`, opt);
  if (res) {
    return res;
  }
};

module.exports = {
  hasCalcFunc,
  hasVarFunc,
  isGlobalKeyword,
  isValidPropertyValue,
  parseAngle,
  parseCSS,
  parseColor,
  parseGradient,
  parseLength,
  parseLengthPercentage,
  parseNumber,
  parsePercentage,
  parsePropertyValue,
  parseString,
  parseURL,
  prepareValue,
  resolveCalc,
  splitValue
};
