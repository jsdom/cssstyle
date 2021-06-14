/*********************************************************************
 * These are commonly used parsers for CSS Values they take a string *
 * to parse and return a string after it's been converted, if needed *
 ********************************************************************/
'use strict';

const namedColors = require('./named_colors.json');
const { hslToRgb } = require('./utils/colorSpace');

// the following are deprecated in CSS3
namedColors.push(
  'activeborder',
  'activecaption',
  'appworkspace',
  'background',
  'buttonface',
  'buttonhighlight',
  'buttonshadow',
  'buttontext',
  'captiontext',
  'graytext',
  'highlight',
  'highlighttext',
  'inactiveborder',
  'inactivecaption',
  'inactivecaptiontext',
  'infobackground',
  'infotext',
  'menu',
  'menutext',
  'scrollbar',
  'threeddarkshadow',
  'threedface',
  'threedhighlight',
  'threedlightshadow',
  'threedshadow',
  'window',
  'windowframe',
  'windowtext'
);

/**
 * https://drafts.csswg.org/css-syntax-3/#newline
 * https://drafts.csswg.org/css-syntax-3/#whitespace
 *
 * <newline> is \n.
 * <whitespace> is ASCII whitespace, \n, or \t.
 *
 * \r, \f, and \r\n are replaced by \n in the preprocessing step.
 * \s matches <newline>, <whitespace>, UTF16 whitespaces, \r, \f, and \v.
 */
const newline = '\\n\\r\\f';
const whitespace = `[ \\t${newline}]`;

/**
 * CSS tokens
 *
 * https://drafts.csswg.org/css-syntax-3/#tokenization
 */
const ws = `${whitespace}*`;
const hexDigit = '[\\da-f]';
const escape = `\\\\([^\\n\\da-f]|${hexDigit}{1,6}${ws})`;
const ident = `(-?([_a-z]|${escape})([-_\\w]|${escape})*|--([-_\\w]|${escape})*)`;
const integer = '[-+]?\\d+';
const number = `((${integer})(\\.\\d+)?|[-+]?(\\.\\d+))(e[-+]?${integer})?`;
const percentage = `(${number})(%)`;
const identRegEx = new RegExp(`^${ident}$`, 'i');
const integerRegEx = new RegExp(`^${integer}$`);
const numberRegEx = new RegExp(`^${number}$`);
const percentageRegEx = new RegExp(`^${percentage}$`);
const stringRegEx = /^("[^"]*"|'[^']*')$/;
const urlRegEx = /^url\(\s*([^)]*)\s*\)$/;
const whitespaceRegEx = new RegExp(`^${whitespace}$`);
const trailingWhitespaceRegEx = new RegExp(`.*${whitespace}$`);

/**
 * CSS types
 *
 * https://drafts.csswg.org/css-values-4/
 */
const angle = `(${number})(deg|grad|rad|turn)`;
const length = `(${number})(ch|cm|r?em|ex|in|lh|mm|pc|pt|px|q|vh|vmin|vmax|vw)`;
const angleRegEx = new RegExp(`^${angle}$`, 'i');
const calcOperatorRegEx = new RegExp(
  `^${whitespace}[-+]${whitespace}|${whitespace}?[*/]${whitespace}?$`
);
const calcRegEx = new RegExp(`^calc\\(${ws}(.+)${ws}\\)$`, 'i');
const colorRegEx1 = /^#([0-9a-fA-F]{3,4}){1,2}$/;
const colorRegEx2 = /^rgb\(([^)]*)\)$/;
const colorRegEx3 = /^rgba\(([^)]*)\)$/;
const colorRegEx4 = /^hsla?\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*(,\s*(-?\d+|-?\d*.\d+)\s*)?\)/;
const lengthRegEx = new RegExp(`^${length}$`, 'i');
const numericRegEx = new RegExp(`^(${number})(%|${ident})?$`, 'i');
const timeRegEx = new RegExp(`^(${number})(m?s)$`, 'i');

/**
 * https://drafts.csswg.org/css-values-4/#integers
 * https://drafts.csswg.org/cssom/#ref-for-integer-value
 */
exports.parseInteger = function parseInteger(val) {
  const calculated = exports.parseCalc(val);
  if (calculated) {
    val = calculated;
  }
  if (numberRegEx.test(val)) {
    return String(parseInt(val, 10));
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#numbers
 * https://drafts.csswg.org/cssom/#ref-for-number-value
 */
exports.parseNumber = function parseNumber(val) {
  const calculated = exports.parseCalc(val);
  if (calculated) {
    val = calculated;
  }
  if (numberRegEx.test(val)) {
    return String(parseFloat(val));
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#lengths
 * https://drafts.csswg.org/cssom/#ref-for-length-value
 */
exports.parseLength = function parseLength(val, resolve = false) {
  if (val === '0') {
    return '0px';
  }
  const calculated = exports.parseCalc(val, v => parseLength(v, resolve));
  if (calculated) {
    if (!resolve) {
      return calculated;
    }
    [, val] = calcRegEx.exec(calculated);
  }
  const res = lengthRegEx.exec(val);
  if (res) {
    let [, number, , , , , , unit] = res;
    unit = unit.toLowerCase();
    if (resolve) {
      switch (unit) {
        case 'cm':
          number *= 96 / 2.54;
          unit = 'px';
          break;
        case 'mm':
          number *= 96 / 2.54 / 10;
          unit = 'px';
          break;
        case 'q':
          number *= 96 / 2.54 / 40;
          unit = 'px';
          break;
        case 'in':
          number *= 96;
          unit = 'px';
          break;
        case 'pc':
          number *= 96 / 6;
          unit = 'px';
          break;
        case 'pt':
          number *= 96 / 72;
          unit = 'px';
          break;
      }
    }
    return number + unit;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#percentages
 * https://drafts.csswg.org/cssom/#ref-for-percentage-value
 */
exports.parsePercentage = function parsePercentage(val, resolve = false) {
  if (val === '0') {
    return '0%';
  }
  const calculated = exports.parseCalc(val, v => parsePercentage(v, resolve));
  if (calculated) {
    if (!resolve) {
      return calculated;
    }
    [, val] = calcRegEx.exec(calculated);
  }
  if (percentageRegEx.test(val)) {
    return val;
  }
  return exports.parseCustomVariable(val);
};

exports.parseLengthOrPercentage = function parseLengthOrPercentage(val, resolve) {
  return exports.parseLength(val, resolve) || exports.parsePercentage(val, resolve);
};

/**
 * https://drafts.csswg.org/css-values-4/#angles
 * https://drafts.csswg.org/cssom/#ref-for-angle-value
 *
 * For legacy reasons, some uses of <angle> allow a bare 0 to mean 0deg, eg. in
 * linear-gradient(0, <color>, <color>).
 */
exports.parseAngle = function parseAngle(val, resolve = false) {
  const calculated = exports.parseCalc(val, v => parseAngle(v, resolve));
  if (calculated) {
    if (!resolve) {
      return calculated;
    }
    [, val] = calcRegEx.exec(calculated);
  }
  const res = angleRegEx.exec(val);
  if (res) {
    let [, number, , , , , , unit = ''] = res;
    unit = unit.toLowerCase();
    if (resolve) {
      if (unit === 'rad') {
        number *= 180 / Math.PI;
      } else if (unit === 'grad') {
        number *= 360 / 400;
      } else if (unit === 'turn') {
        number *= 360;
      }
      number = Math.abs(number % 360);
      unit = 'deg';
    }
    return number + unit;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#time
 * https://drafts.csswg.org/cssom/#ref-for-time-value
 */
exports.parseTime = function parseTime(val, resolve = false) {
  const calculated = exports.parseCalc(val, v => parseTime(v, resolve));
  if (calculated) {
    if (!resolve) {
      return calculated;
    }
    [, val] = calcRegEx.exec(calculated);
  }
  const res = timeRegEx.exec(val);
  if (res) {
    let [, number, , , , , , unit] = res;
    unit = unit.toLowerCase();
    if (resolve && unit === 's') {
      number *= 1000;
      unit = 'ms';
    }
    return number + unit;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#calc-notation
 *
 * + and - should be wrapped between spaces.
 *
 * It resolves expressions recursively in calc() if one of their two operands is
 * unitless or if both have the same unit type.
 *
 * It resolves to <number> if the <calc-expression> is resolved to a <number>,
 * otherwise to calc(<dimension-percentage>) or calc(<calc-expression>).
 *
 * TODO: handle Infinity, division by 0, and positive/negative 0, as specified
 * in CSS Values 4.
 */
exports.parseCalc = function parseCalc(val, parseOperand = exports.parseNumber) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  const res = calcRegEx.exec(val);
  if (!res) {
    return null;
  }

  // Replace ( by calc( when not preceded by var or calc
  const stringArgs = res[1].replace(/^\(/, 'calc(').replace(/[^rc]\(/gi, 'calc(');
  const operators = /[-+*/]/;
  const [operands, ops] = exports.splitTokens(stringArgs, operators);
  const { length: operandCount } = operands;

  if (ops.some(operator => !calcOperatorRegEx.test(operator))) {
    return null;
  }

  // Shunting-yard algorithm, eg. with (1 + 2) * 3 terms are [1, 2, +, 3, *]
  const terms = [];
  const stack = [];
  for (let i = 0; i < operandCount; i++) {
    if (i > 0) {
      const operator = ops[i - 1].trim();
      let o = stack.length;
      // higher or equal precedence than operator at the top of stack
      while (stack[--o] && (stack[o] === operator || stack[o] === '*' || stack[o] === '/')) {
        terms.push(stack.pop());
      }
      stack.push(operator);
      if (i === operandCount) {
        break;
      }
    }

    let operand = operands[i];

    const calculated = exports.parseCalc(operand, parseOperand);
    if (calculated) {
      // Try to extract a numeric operand from nested calc eg. 2px from calc(1px + calc(1px + 1px))
      operand = parseOperand(calculated);
      if (calcRegEx.test(operand)) {
        terms.push([operand, null]);
        continue;
      }
    }

    const number = exports.parseNumber(operand);
    if (number) {
      terms.push([operand, '']);
      continue;
    }

    const res = numericRegEx.exec(parseOperand(operand));
    if (res) {
      const [, number, , , , , , unit] = res;
      terms.push([number, unit]);
      continue;
    }

    return null;
  }

  if (terms === undefined) {
    return null;
  }

  terms.push(...stack.reverse());

  // Evaluate operations
  const numerics = [];
  const { length: termsCount } = terms;
  for (let i = 0; i < termsCount; i++) {
    const term = terms[i];

    if (operators.test(term)) {
      const [v2, unit2] = numerics.pop();
      const [v1, unit1] = numerics.pop();
      if (
        // + or - and 0 and <dimension-percentage>
        ((term === '+' || term === '-') &&
          ((v1 === '0' && unit1 === '' && unit2) || (v2 === '0' && unit2 === '' && unit1))) ||
        // * or / and <dimension-percentage> with different units
        ((term === '*' || term === '/') && unit1 && unit2 && unit1 !== unit2)
      ) {
        return null;
      }
      // <dimension-percentage> with different units or unresolved operand
      if ((unit1 !== unit2 && unit1 !== '' && unit2 !== '') || unit1 === null || unit2 === null) {
        numerics.push([`${v1}${unit1 || ''} ${term} ${v2}${unit2 || ''}`, null]);
        continue;
      }

      const unit = unit1 || unit2;
      switch (term) {
        case '+':
          numerics.push([Number(v1) + Number(v2), unit]);
          break;
        case '-':
          numerics.push([Number(v1) - Number(v2), unit]);
          break;
        case '*':
          numerics.push([Number(v1) * Number(v2), unit]);
          break;
        case '/':
          numerics.push([Number(v1) / Number(v2), unit]);
          break;
        default:
          return null;
      }
      continue;
    }
    numerics.push(term);
  }

  if (numerics.length !== 1) {
    return null;
  }

  const [value, unit] = numerics[0];

  if (unit === '') {
    // Parse result for dimension type and/or positive requirements
    return parseOperand(String(value));
  }
  return `calc(${value}${unit || ''})`;
};

/**
 * https://drafts.csswg.org/css-values-4/#keywords
 * https://drafts.csswg.org/cssom/#ref-for-value-def-identifier
 */
exports.parseKeyword = function parseKeyword(
  val,
  valid = ['initial', 'inherit', 'revert', 'unset']
) {
  const lowerCaseValue = val.toLowerCase();
  if (valid.includes(lowerCaseValue)) {
    return lowerCaseValue;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#custom-idents
 * https://drafts.csswg.org/cssom/#ref-for-value-def-identifier
 */
exports.parseCustomIdentifier = function parseCustomIdentifier(val) {
  if (identRegEx.test(val) && !exports.parseKeyword(val) && val !== 'default') {
    return val;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#dashed-idents
 * https://drafts.csswg.org/cssom/#ref-for-value-def-identifier
 *
 * Aka. explicitly author-defined identifier or custom property.
 *
 * It is used as a custom variable argument, ie. var(<dashed-ident>).
 */
exports.parseDashedIdentifier = function parseDashedIdentifier(val) {
  if (identRegEx.test(val) && val.startsWith('--')) {
    return val;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#urls
 * https://drafts.csswg.org/cssom/#ref-for-url-value
 */
exports.parseUrl = function parseUrl(val) {
  var res = urlRegEx.exec(val);
  // does it match the regex?
  if (res) {
    var str = res[1];
    // if it starts with single or double quotes, does it end with the same?
    if ((str[0] === '"' || str[0] === "'") && str[0] !== str[str.length - 1]) {
      return null;
    }
    if (str[0] === '"' || str[0] === "'") {
      str = str.substr(1, str.length - 2);
    }

    var i;
    for (i = 0; i < str.length; i++) {
      switch (str[i]) {
        case '(':
        case ')':
        case ' ':
        case '\t':
        case '\n':
        case "'":
        case '"':
          return null;
        case '\\':
          i++;
          break;
      }
    }

    return 'url(' + str + ')';
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#strings
 * https://drafts.csswg.org/cssom/#ref-for-string-value
 */
exports.parseString = function parseString(val) {
  if (stringRegEx.test(val)) {
    var i;
    for (i = 1; i < val.length - 1; i++) {
      switch (val[i]) {
        case val[0]:
          return null;
        case '\\':
          i++;
          while (i < val.length - 1 && /[0-9A-Fa-f]/.test(val[i])) {
            i++;
          }
          break;
      }
    }
    if (i >= val.length) {
      return null;
    }
    return val;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-color/#color-type
 * https://drafts.csswg.org/cssom/#ref-for-valuea-def-color
 */
exports.parseColor = function parseColor(val) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  var red,
    green,
    blue,
    hue,
    saturation,
    lightness,
    alpha = 1;
  var parts;
  var res = colorRegEx1.exec(val);
  // is it #aaa, #ababab, #aaaa, #abababaa
  if (res) {
    var defaultHex = val.substr(1);
    var hex = val.substr(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

      if (defaultHex.length === 4) {
        hex = hex + defaultHex[3] + defaultHex[3];
      }
    }
    red = parseInt(hex.substr(0, 2), 16);
    green = parseInt(hex.substr(2, 2), 16);
    blue = parseInt(hex.substr(4, 2), 16);
    if (hex.length === 8) {
      var hexAlpha = hex.substr(6, 2);
      var hexAlphaToRgbaAlpha = Number((parseInt(hexAlpha, 16) / 255).toFixed(3));

      return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + hexAlphaToRgbaAlpha + ')';
    }
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
  }

  res = colorRegEx2.exec(val);
  if (res) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 3) {
      return null;
    }
    if (parts.every(percentageRegEx.test.bind(percentageRegEx))) {
      red = Math.floor((parseFloat(parts[0].slice(0, -1)) * 255) / 100);
      green = Math.floor((parseFloat(parts[1].slice(0, -1)) * 255) / 100);
      blue = Math.floor((parseFloat(parts[2].slice(0, -1)) * 255) / 100);
    } else if (parts.every(integerRegEx.test.bind(integerRegEx))) {
      red = parseInt(parts[0], 10);
      green = parseInt(parts[1], 10);
      blue = parseInt(parts[2], 10);
    } else {
      return null;
    }
    red = Math.min(255, Math.max(0, red));
    green = Math.min(255, Math.max(0, green));
    blue = Math.min(255, Math.max(0, blue));
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
  }

  res = colorRegEx3.exec(val);
  if (res) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 4) {
      return null;
    }
    if (parts.slice(0, 3).every(percentageRegEx.test.bind(percentageRegEx))) {
      red = Math.floor((parseFloat(parts[0].slice(0, -1)) * 255) / 100);
      green = Math.floor((parseFloat(parts[1].slice(0, -1)) * 255) / 100);
      blue = Math.floor((parseFloat(parts[2].slice(0, -1)) * 255) / 100);
      alpha = parseFloat(parts[3]);
    } else if (parts.slice(0, 3).every(integerRegEx.test.bind(integerRegEx))) {
      red = parseInt(parts[0], 10);
      green = parseInt(parts[1], 10);
      blue = parseInt(parts[2], 10);
      alpha = parseFloat(parts[3]);
    } else {
      return null;
    }
    if (isNaN(alpha)) {
      alpha = 1;
    }
    red = Math.min(255, Math.max(0, red));
    green = Math.min(255, Math.max(0, green));
    blue = Math.min(255, Math.max(0, blue));
    alpha = Math.min(1, Math.max(0, alpha));
    if (alpha === 1) {
      return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    }
    return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
  }

  res = colorRegEx4.exec(val);
  if (res) {
    const [, _hue, _saturation, _lightness, _alphaString = ''] = res;
    const _alpha = parseFloat(_alphaString.replace(',', '').trim());
    if (!_hue || !_saturation || !_lightness) {
      return null;
    }
    hue = parseFloat(_hue);
    saturation = parseInt(_saturation, 10);
    lightness = parseInt(_lightness, 10);
    if (_alpha && numberRegEx.test(_alpha)) {
      alpha = parseFloat(_alpha);
    }

    const [r, g, b] = hslToRgb(hue, saturation / 100, lightness / 100);
    if (!_alphaString || alpha === 1) {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }

  return exports.parseKeyword(val, namedColors);
};

/**
 * https://www.w3.org/TR/css-variables-1/#using-variables
 */
exports.parseCustomVariable = function parseCustomVariable(val) {
  let before = '';
  let call = '';
  let i = -1;
  let char;
  while ((char = val[++i]) && call !== 'var(') {
    if (/[var(]/i.test(char)) {
      if ('var('.startsWith(call)) {
        call += char.toLowerCase();
      } else {
        before += call;
        call = char;
      }
    } else {
      before += call;
      call = '';
      before += char;
    }
  }

  if (call !== 'var(') {
    return null;
  }

  let open = 1;
  let j = i;
  while ((char = val[++j]) && open > 0) {
    if (char === '(') {
      open++;
    } else if (char === ')') {
      open--;
    }
  }

  const splitIndex = open ? j : j - 1;
  const stringArgs = val.slice(i, splitIndex);
  const after = val.slice(splitIndex) || '';
  const [args] = exports.splitTokens(stringArgs, /,/);
  const property = exports.parseDashedIdentifier(args.shift());

  if (!property) {
    return null;
  }

  const parsedArgs = [property];
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (arg.toLowerCase().startsWith('var(')) {
      arg = parseCustomVariable(arg);
      if (arg === null) {
        return null;
      }
    }
    parsedArgs.push(arg);
  }

  return `${before}var(${parsedArgs.join(', ')}${after}`;
};

/**
 * utility to translate from border-width to borderWidth
 *
 * @param {string} property
 * @param {boolean} [lowercaseFirst]
 * @see https://drafts.csswg.org/cssom/#css-property-to-idl-attribute
 */
function cssPropertyToIDLAttribute(property, lowercaseFirst = false) {
  let output = '';
  let uppercaseNext = false;

  if (lowercaseFirst) {
    property = property.substring(1);
  }

  for (const c of property) {
    if (c === '-') {
      uppercaseNext = true;
    } else if (uppercaseNext) {
      uppercaseNext = false;
      output += c.toUpperCase();
    } else {
      output += c;
    }
  }

  return output;
}
exports.cssPropertyToIDLAttribute = cssPropertyToIDLAttribute;

/**
 * @param {string} val
 * @param {RegExp} separators
 * @returns
 *
 * This function is used to split args from a function, components from a value,
 * or a list of values, that can have nested item sharing the same separator(s).
 *
 * Leading/trailing whitespaces are expected to be trimmed from value.
 */
exports.splitTokens = function splitTokens(val, separators = whitespaceRegEx) {
  let argIndex = 0;
  let depth = 0;

  const seps = [];
  const args = Array.from(val).reduce((args, char) => {
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
    } else if (depth === 0 && separators.test(char)) {
      if (args[argIndex] === undefined) {
        // Create empty arg
        if (!whitespaceRegEx.test(char) && !whitespaceRegEx.test(seps[argIndex - 1])) {
          args[argIndex] = '';
        }
        // Keep separator with (single) leading whitespace
        if (whitespaceRegEx.test(seps[argIndex - 1])) {
          if (char !== ' ') {
            seps[argIndex - 1] += char;
          }
          return args;
        }
        // Keep separator with (single) trailing whitespace
        if (whitespaceRegEx.test(char)) {
          if (!trailingWhitespaceRegEx.test(seps[argIndex - 1])) {
            seps[argIndex - 1] += char;
          }
          return args;
        }
      }
      // Pop trailing whitespace from arg when not specified as an operator
      if (trailingWhitespaceRegEx.test(args[argIndex])) {
        char = args[argIndex].slice(-1) + char;
        args[argIndex] = args[argIndex].slice(0, -1);
      }
      argIndex++;
      seps.push(char);
      return args;
    }
    if (args[argIndex] === undefined) {
      if (whitespaceRegEx.test(char)) {
        seps[argIndex - 1] += char;
      } else {
        args.push(char);
      }
    } else {
      args[argIndex] += char;
    }
    return args;
  }, []);

  if (args.length === seps.length) {
    args.push('');
  }

  return [args.map(a => a.trim('')), seps];
};

/**
 * @param {string} value
 * @param {object} longhands
 * @returns {object | null}
 *
 * this either returns null meaning that it isn't valid
 * or returns an object where the keys are dashed short
 * hand properties and the values are the values to set
 * on them
 */
exports.parseShorthand = function parseShorthand(value, longhands) {
  const parsed = {};
  const [components] = exports.splitTokens(value);
  const entries = Object.entries(longhands);
  const valid = components.every((component, position) =>
    entries.some(longhand => {
      const [property, { parse }] = longhand;
      if (!parsed[property]) {
        const value = parse(component, position);
        if (value !== null) {
          parsed[property] = value;
          return true;
        }
      }
      return false;
    })
  );
  if (valid) {
    return entries.reduce(
      (longhands, [property]) => ({ ...longhands, [property]: parsed[property] || 'initial' }),
      {}
    );
  }
  return null;
};

/**
 * @param {string} value
 * @param {object} longhands
 * @returns {object | null}
 */
exports.parseImplicitShorthand = function parseImplicitShorthand(value, longhands) {
  const [components] = exports.splitTokens(value);
  const entries = Object.entries(longhands);
  const { length: longhandLength } = entries;
  let { length: currentLength } = components;
  const valid =
    currentLength / longhandLength <= 1 &&
    components.every((component, i) => {
      const [, { parse }] = entries[i];
      const value = parse(component);
      if (value === null) {
        return false;
      }
      components[i] = value;
      return true;
    });
  if (valid) {
    while (currentLength < longhandLength) {
      components.push(components[Math.max(0, currentLength++ - 2)]);
    }
    return entries.reduce(
      (longhands, [property], i) => ({ ...longhands, [property]: components[i] }),
      {}
    );
  }
  return null;
};

/**
 * @param {object} longhands
 * @param {function?} parse
 * @return {boolean}
 *
 * It should set longhands with values parsed from shorthand component values.
 *
 * The parse function should return an object with longhands as props assigned
 * their parsed component value. A null object means that the specified value is
 * invalid.
 */
exports.createShorthandSetter = function createShorthandSetter(
  longhands,
  parse = exports.parseShorthand
) {
  return function setShorthand(value) {
    const parsed = parse(value, longhands);
    if (parsed === null) {
      return false;
    }
    Object.entries(parsed).forEach(([property, value]) => (this[property] = value));
    return true;
  };
};

/**
 * @param {array} components
 * @param {string} glue
 * @returns {string}
 */
exports.serializeShorthand = function serializeShorthand(components, glue = ' ') {
  const [same, ...values] = components;
  // All component values are the same CSS wide keyword
  if (values.every(value => value === same)) {
    return same;
  }
  // Filter out initial
  components = components.filter(value => value !== 'initial');
  // Some (but not all) component values are CSS wide keywords
  if (components.some(value => exports.parseKeyword(value))) {
    return '';
  }
  // Filter out empty string
  return components.filter(Boolean).join(glue);
};

/**
 * @param {array} components longhand values
 * @returns {string}
 */
exports.serializeImplicitShorthand = function serializeImplicitShorthand(components) {
  const [same, ...values] = components;
  // All component values are equals
  if (values.every(value => value === same)) {
    return same;
  }
  // Some (but not all) component values are empty string or CSS wide keywords
  if (components.some(value => value === '' || exports.parseKeyword(value))) {
    return '';
  }
  // Reduce shorthand value to its minimal expression
  if (components.length === 4 && components[3] === components[1]) {
    components.pop();
  }
  if (components.length === 3 && components[2] === components[0]) {
    components.pop();
  }
  return components.join(' ');
};

/**
 * @param {object} longhands
 * @param {function} serialize
 * @returns {string}
 */
exports.createShorthandGetter = function createShorthandGetter(
  longhands,
  serialize = exports.serializeShorthand
) {
  return function getShorthand() {
    return serialize(Object.keys(longhands).map(property => this[property]));
  };
};

const camel_to_dashed = /[A-Z]/g;

/**
 * @param {string} attribute
 * @param {boolean} [dashPrefix]
 * @see https://drafts.csswg.org/cssom/#idl-attribute-to-css-property
 */
exports.idlAttributeToCSSProperty = (attribute, dashPrefix = false) => {
  let output = dashPrefix ? '-' : '';
  output += attribute.replace(camel_to_dashed, '-$&').toLowerCase();
  return output;
};
