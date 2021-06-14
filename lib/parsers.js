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
const escapeRegEx = new RegExp(`${escape}`, 'i');
const identRegEx = new RegExp(`^${ident}$`, 'i');
const numberRegEx = new RegExp(`^${number}$`);
const percentageRegEx = new RegExp(`^${percentage}$`);
const stringRegEx = /^("[^"]*"|'[^']*')$/;
const urlRegEx = new RegExp(`^url\\(${ws}([^"'() \\t${newline}\\\\]|${escape})+${ws}\\)$`, 'i');
const whitespaceRegEx = new RegExp(`^${whitespace}$`);
const trailingWhitespaceRegEx = new RegExp(`.*${whitespace}$`);

exports.ws = ws;
exports.whitespace = whitespace;

/**
 * CSS types
 *
 * https://drafts.csswg.org/css-values-4/
 */
const angle = `(${number})(deg|grad|rad|turn)`;
const length = `(${number})(ch|cm|r?em|ex|in|lh|mm|pc|pt|px|q|vh|vmin|vmax|vw)`;
const linearGradientPositions = [['right', 'left'], ['bottom', 'top']];
const positions = linearGradientPositions.concat('center');
const angleRegEx = new RegExp(`^${angle}$`, 'i');
const calcOperatorRegEx = new RegExp(
  `^${whitespace}[-+]${whitespace}|${whitespace}?[*/]${whitespace}?$`
);
const calcRegEx = new RegExp(`^calc\\(${ws}(.+)${ws}\\)$`, 'i');
const colorHexRegEx = new RegExp(`^#(${hexDigit}{3,4}){1,2}$`, 'i');
const colorFnSeparatorsRegEx = new RegExp(`,|/|${whitespace}`);
const colorFnRegEx = new RegExp(`^(hsl|rgb)a?\\(${ws}(.+)${ws}\\)$`, 'i');
const conicGradientConfigRegEx1 = new RegExp(
  `^from${whitespace}+(.+)${whitespace}+at${whitespace}+(.+)$`,
  'i'
);
const conicGradientConfigRegEx2 = new RegExp(`^from${whitespace}+(.+)$`, 'i');
const conicGradientConfigRegEx3 = new RegExp(`^at${whitespace}+(.+)$`, 'i');
const linearGradientConfigRegEx = new RegExp(`^to${whitespace}+(.+)$`, 'i');
const radialGradientConfigRegEx1 = new RegExp(`^((.+)${whitespace}+)?at${whitespace}+(.+)$`);
const radialGradientConfigRegEx2 = new RegExp(`^((.+)${whitespace}+)?(circle|ellipse)$`);
const radialGradientConfigRegEx3 = new RegExp(`^(circle|ellipse)${whitespace}+(.+)$`);
const gradientRegEx = new RegExp(
  `^(repeating-)?(conic|linear|radial)-gradient\\(${ws}(.+)${ws}\\)$`,
  'i'
);
const lengthRegEx = new RegExp(`^${length}$`, 'i');
const numericRegEx = new RegExp(`^(${number})(%|${ident})?$`, 'i');
const resourceRegEx = new RegExp(`^(src|url)\\(${ws}(.*)${ws}\\)$`, 'i');
const timeRegEx = new RegExp(`^(${number})(m?s)$`, 'i');

/**
 * https://drafts.csswg.org/cssom/#serialize-a-css-component-value
 *
 * "A base-ten number using digits 0-9 in the shortest form possible" should be
 * returned, but browsers may use the E notation even when it is not used in the
 * specified value.
 *
 * Browsers seem to always remove trailing 0 in decimals, even when this is not
 * specified for the corresponding property.
 *
 * Browsers seem to always add a missing leading 0 in floating number, even when
 * this is not specified for the corresponding property.
 */
function serializeNumber(n) {
  return `${+(+n).toPrecision(6)}`;
}

/**
 * https://drafts.csswg.org/css-values-4/#integers
 * https://drafts.csswg.org/cssom/#ref-for-integer-value
 */
exports.parseInteger = function parseInteger(val, positive = false) {
  const calculated = exports.parseCalc(val);
  if (calculated) {
    val = calculated;
  }
  const res = numberRegEx.exec(val);
  if (res) {
    const [, , integer, decimals, onlyDecimals, exponent] = res;
    const invalid =
      integer === undefined ||
      decimals ||
      onlyDecimals ||
      (exponent && exponent.slice(1) < 0) ||
      (positive && integer < 0);
    if (invalid) {
      return null;
    }
    return serializeNumber(val);
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#numbers
 * https://drafts.csswg.org/cssom/#ref-for-number-value
 */
exports.parseNumber = function parseNumber(val, positive = false) {
  const calculated = exports.parseCalc(val);
  if (calculated) {
    val = calculated;
  }
  if (numberRegEx.test(val)) {
    if (positive && val < 0) {
      return null;
    }
    return serializeNumber(val);
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#lengths
 * https://drafts.csswg.org/cssom/#ref-for-length-value
 */
exports.parseLength = function parseLength(val, resolve = false, positive = false) {
  if (val === '0') {
    return '0px';
  }
  const calculated = exports.parseCalc(val, v => parseLength(v, resolve, positive));
  if (calculated) {
    if (!resolve) {
      return calculated;
    }
    [, val] = calcRegEx.exec(calculated);
  }
  const res = lengthRegEx.exec(val);
  if (res) {
    let [, number, , , , , , unit] = res;
    if (positive && number < 0) {
      return null;
    }
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
    return serializeNumber(number) + unit;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#percentages
 * https://drafts.csswg.org/cssom/#ref-for-percentage-value
 */
exports.parsePercentage = function parsePercentage(val, resolve = false, positive = false) {
  if (val === '0') {
    return '0%';
  }
  const calculated = exports.parseCalc(val, v => parsePercentage(v, resolve, positive));
  if (calculated) {
    if (!resolve) {
      return calculated;
    }
    [, val] = calcRegEx.exec(calculated);
  }
  const res = percentageRegEx.exec(val);
  if (res) {
    const [, number] = res;
    if (positive && number < 0) {
      return null;
    }
    return serializeNumber(number) + '%';
  }
  return exports.parseCustomVariable(val);
};

exports.parseLengthOrPercentage = function parseLengthOrPercentage(val, resolve, positive) {
  return (
    exports.parseLength(val, resolve, positive) || exports.parsePercentage(val, resolve, positive)
  );
};

/**
 * https://drafts.csswg.org/cssom/#ref-for-alphavalue-def
 *
 * Browsers store a gradient alpha value as an 8 bit unsigned integer value when
 * given as a percentage, while they store a gradient alpha value as a decimal
 * value when given as a number, or when given an opacity value as a number or
 * percentage.
 */
exports.parseAlpha = function parseAlpha(val, is8Bit = false) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }
  let parsed = exports.parseNumber(val);
  if (parsed !== null) {
    is8Bit = false;
    val = Math.min(1, Math.max(0, parsed)) * 100;
  } else if ((parsed = exports.parsePercentage(val, true))) {
    val = Math.min(100, Math.max(0, parsed.slice(0, -1)));
  } else {
    return null;
  }

  if (!is8Bit) {
    return serializeNumber(val / 100);
  }

  // Fix JS precision (eg. 50 * 2.55 === 127.499... instead of 127.5) with toPrecision(15)
  const alpha = Math.round((val * 2.55).toPrecision(15));
  const integer = Math.round(alpha / 2.55);
  const hasInteger = Math.round((integer * 2.55).toPrecision(15)) === alpha;

  return String(hasInteger ? integer / 100 : Math.round(alpha / 0.255) / 1000);
};

/**
 * https://drafts.csswg.org/css-values-4/#angles
 * https://drafts.csswg.org/cssom/#ref-for-angle-value
 *
 * For legacy reasons, some uses of <angle> allow a bare 0 to mean 0deg, eg. in
 * linear-gradient(0, <color>, <color>).
 */
exports.parseAngle = function parseAngle(val, resolve = false) {
  if (val === '0') {
    return '0deg';
  }
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
    return serializeNumber(number) + unit;
  }
  return exports.parseCustomVariable(val);
};

exports.parseAngleOrPercentage = function parseAngleOrPercentage(val, resolve, positive) {
  return (
    exports.parseAngle(val, resolve, positive) || exports.parsePercentage(val, resolve, positive)
  );
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
    return serializeNumber(number) + unit;
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
 * https://drafts.csswg.org/css-backgrounds-3/#typedef-box
 */
exports.parseBox = function parseBox(val) {
  return exports.parseKeyword(val, ['border-box', 'content-box', 'padding-box']);
};

/**
 * https://drafts.csswg.org/css-shapes-1/#typedef-shape-box
 */
exports.parseShapeBox = function parseShapeBox(val) {
  return exports.parseBox(val) || exports.parseKeyword(val, ['margin-box']);
};

/**
 * https://drafts.fxtf.org/css-masking-1/#typedef-geometry-box
 */
exports.parseGeometryBox = function parseGeometryBox(val) {
  return (
    exports.parseShapeBox(val) || exports.parseKeyword(val, ['fill-box', 'stroke-box', 'view-box'])
  );
};

/**
 * https://drafts.csswg.org/css-images-4/#image-values
 *
 * TODO: <image-set()>, <cross-fade()>, <element()>.
 */
exports.parseImage = function parseImage(val) {
  return exports.parseResource(val) || exports.parseGradient(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#urls
 * https://drafts.csswg.org/cssom/#ref-for-url-value
 *
 * url(<url>)
 * url(<string> <url-modifier>?)
 * src(<string> <url-modifier>?)
 * src(<custom-var> <url-modifier>?)
 *
 * TODO: handle <url-modifier> (<ident> or <fn>).
 */
exports.parseResource = function parseResource(val) {
  const res = resourceRegEx.exec(val);
  if (res) {
    let [, type, urlOrString] = res;
    type = type.toLowerCase();
    urlOrString = urlOrString.replace(escapeRegEx, m => m.trim());
    if (urlOrString.replace(/"|'/g, '').trim() === '') {
      return null;
    }
    const variable = exports.parseCustomVariable(urlOrString);
    if (variable) {
      if (type === 'src') {
        return `src(${variable})`;
      }
      return null;
    }
    const string = exports.parseString(urlOrString);
    if (string) {
      return `${type}(${string})`;
    }
    if (type === 'url' && urlRegEx.test(`url(${urlOrString})`)) {
      return `url("${urlOrString}")`;
    }
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-values-4/#strings
 * https://drafts.csswg.org/cssom/#ref-for-string-value
 */
exports.parseString = function parseString(val) {
  const res = stringRegEx.exec(val);
  if (res) {
    const [, str] = res;
    const [openQuote] = str;
    const closeQuote = str.slice(-1);
    if (openQuote !== closeQuote) {
      return null;
    }
    const string = str.slice(1, -1);
    const stringContentRegEx = new RegExp(
      `^([^${openQuote}\\\\${newline}]|${escape}|\\\\[${newline}])*$`
    );
    if (stringContentRegEx.test(string)) {
      return `"${string}"`;
    }
    return null;
  }
  return exports.parseCustomVariable(val);
};

/**
 * https://drafts.csswg.org/css-color/#color-type
 * https://drafts.csswg.org/cssom/#ref-for-valuea-def-color
 *
 * TODO: <hwb()>, <lab()>, <lch()>, <color()>, <device-cmyk()>.
 */
exports.parseColor = function parseColor(val) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  const rgb = [];

  /**
   * <hex-color>
   *   value should be `#` followed by 3, 4, 6, or 8 hexadecimal digits
   *   value should be resolved to <rgb()> | <rgba()>
   *   value should be resolved to <rgb()> if <alpha> === 1
   */
  const hex = colorHexRegEx.exec(val);

  if (hex) {
    const [, n1, n2, n3, n4, n5, n6, n7, n8] = val;
    let alpha = 1;

    switch (val.length) {
      case 4:
        rgb.push(Number(`0x${n1}${n1}`), Number(`0x${n2}${n2}`), Number(`0x${n3}${n3}`));
        break;
      case 5:
        rgb.push(Number(`0x${n1}${n1}`), Number(`0x${n2}${n2}`), Number(`0x${n3}${n3}`));
        alpha = Number(`0x${n4}${n4}` / 255);
        break;
      case 7:
        rgb.push(Number(`0x${n1}${n2}`), Number(`0x${n3}${n4}`), Number(`0x${n5}${n6}`));
        break;
      case 9:
        rgb.push(Number(`0x${n1}${n2}`), Number(`0x${n3}${n4}`), Number(`0x${n5}${n6}`));
        alpha = Number(`0x${n7}${n8}` / 255);
        break;
      default:
        return null;
    }

    if (alpha == 1) {
      return `rgb(${rgb.join(', ')})`;
    }
    return `rgba(${rgb.join(', ')}, ${+alpha.toFixed(3)})`;
  }

  /**
   * <rgb()> | <rgba()>
   * <hsl()> | <hsla()>
   *   <arg1>, <arg2>, <arg3>[, <alpha>]? or <arg1> <arg2> <arg3>[ / <alpha>]?
   *   <alpha> should be <number> or <percentage>
   *   <alpha> should be resolved to <number> and clamped to 0-1
   *   value should be resolved to <rgb()> if <alpha> === 1
   */
  const fn = colorFnRegEx.exec(val);
  if (fn) {
    let [, name, args] = fn;
    const [[arg1, arg2, arg3, arg4 = 1], separators] = exports.splitTokens(
      args,
      colorFnSeparatorsRegEx
    );
    const [sep1, sep2, sep3] = separators.map(s => (whitespaceRegEx.test(s) ? s : s.trim()));
    const alpha = exports.parseAlpha(arg4, true);

    name = name.toLowerCase();

    if (
      !alpha ||
      sep1 !== sep2 ||
      ((sep3 && !(sep3 === ',' && sep1 === ',')) || (sep3 === '/' && whitespaceRegEx.test(sep1)))
    ) {
      return null;
    }

    /**
     * <hsl()> | <hsla()>
     *   <hue> should be <angle> or <number>
     *   <hue> should be resolved to <number> and clamped to 0-360 (540 -> 180)
     *   <saturation> and <lightness> should be <percentage> and clamped to 0-100%
     *   value should be resolved to <rgb()> or <rgba()>
     */
    if (name === 'hsl') {
      const hsl = [];
      let hue;
      if ((hue = exports.parseNumber(arg1))) {
        hsl.push((hue /= 60));
      } else if ((hue = exports.parseAngle(arg1, true))) {
        hsl.push(hue.slice(0, -3) / 60);
      } else {
        return null;
      }
      [arg2, arg3].forEach(val => {
        if ((val = exports.parsePercentage(val, true))) {
          return hsl.push(Math.min(100, Math.max(0, val.slice(0, -1))) / 100);
        }
      });
      if (hsl.length < 3) {
        return null;
      }
      rgb.push(...hslToRgb(...hsl));
    }

    /**
     * <rgb()> | <rgba()>
     *   rgb args should all be <number> or <percentage>
     *   rgb args should be resolved to <number> and clamped to 0-255
     */
    if (name === 'rgb') {
      const types = new Set();
      [arg1, arg2, arg3].forEach(val => {
        const number = exports.parseNumber(val);
        if (number) {
          types.add('number');
          rgb.push(Math.round(Math.min(255, Math.max(0, number))));
          return;
        }
        const percentage = exports.parsePercentage(val, true);
        if (percentage) {
          types.add('percent');
          rgb.push(Math.round(Math.min(255, Math.max(0, (percentage.slice(0, -1) / 100) * 255))));
          return;
        }
      });
      if (rgb.length < 3 || types.size > 1) {
        return null;
      }
    }

    if (alpha < 1) {
      return `rgba(${rgb.join(', ')}, ${alpha})`;
    }
    return `rgb(${rgb.join(', ')})`;
  }

  /**
   * <named-color> | <system-color> | currentcolor | transparent
   */
  const name = exports.parseKeyword(val, namedColors);
  if (name) {
    return name;
  }

  return null;
};

/**
 * https://drafts.csswg.org/css-images-4/#gradients
 *
 * <conic-gradient()>, <linear-gradient()>, <radial-gradient()>
 *   args should be <config>, <color-stop>, or <color-hint>
 *   resolved args length, <config> excluded, should be > 1
 *   <config> should be the first arg
 *   <color-stop> should be <color> <start>? <end>?
 *   <color> <start>? <end> should be resolved to <color> <start>?, <color> <end>
 * <conic-gradient()>
 *   <config> should be [from <angle>]? [at <position>]?
 *   <start>, <end>, <color-hint> should be <angle-percentage> where 0 is 0deg
 * <linear-gradient()>, <radial-gradient()>
 *   <start>, <end>, <color-hint> should be <length-percentage> where 0 is 0px
 * <linear-gradient()>
 *   <config> should be <angle> or [to <position>]
 *   <angle> should be in resolved value if not equal or resolved to 180deg
 *   [to <position>] should be in resolved value if <position> is not bottom
 * <radial-gradient()>
 *   <config> should be <shape>? <size>? [at <position>]? or <size>? <shape>? [at <position>]?
 *   <shape> should be circle (default) or ellipse
 *   <shape> should be in resolved value only if defined as circle and either:
 *     <size> is not <length>
 *     <position> is defined
 *   <size> should not be in resolved value if it is farthest-corner
 *   <size> should be <keyword> or positive <length> if <shape> is circle
 *   <size> should be <keyword> or positive <length-percentage>{2} if <shape> is ellipse
 */
exports.parseGradient = function parseGradient(val) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  let res = gradientRegEx.exec(val);
  if (res) {
    let [, repeating = '', gradientType, stringArgs] = res;
    const [args] = exports.splitTokens(stringArgs, /,/);

    if (args.length === 0) {
      return null;
    }

    gradientType = gradientType.toLowerCase();

    const config = [];
    const stops = [];
    const parsedArgs = [];
    let prevArgType;

    if (gradientType === 'conic') {
      let startAngle;
      let startPosition;
      if ((res = conicGradientConfigRegEx1.exec(args[0]))) {
        startAngle = res[1];
        startPosition = res[2];
      } else if ((res = conicGradientConfigRegEx2.exec(args[0]))) {
        startAngle = res[1];
      } else if ((res = conicGradientConfigRegEx3.exec(args[0]))) {
        startPosition = res[1];
      }
      if (startAngle) {
        if ((startAngle = exports.parseAngle(startAngle))) {
          config.push(`from ${startAngle}`);
        } else {
          return null;
        }
      }
      if (startPosition) {
        if ((startPosition = exports.parsePosition(startPosition))) {
          config.push(`at ${startPosition}`);
        } else {
          return null;
        }
      }
      if (config.length > 0) {
        args.shift();
        parsedArgs.push(config.join(' '));
      }

      for (let i = 0; i < args.length; i++) {
        const [stopOrHintArgs] = exports.splitTokens(args[i]);

        if (stopOrHintArgs.length > 3) {
          return null;
        }

        let [colorOrHint, start, end] = stopOrHintArgs;

        if ((colorOrHint = exports.parseAngleOrPercentage(colorOrHint))) {
          if (prevArgType !== 'color' || stopOrHintArgs.length > 1) {
            return null;
          }
          prevArgType = 'hint';
          stops.push(colorOrHint);
          continue;
        }

        const stopArgs = [];

        if ((colorOrHint = exports.parseColor(stopOrHintArgs[0]))) {
          prevArgType = 'color';
          stopArgs.push(colorOrHint);
        } else {
          return null;
        }
        if (start) {
          if ((start = exports.parseAngleOrPercentage(start))) {
            stopArgs.push(start);
          } else {
            return null;
          }
        }
        stops.push(stopArgs.join(' '));
        if (end) {
          if ((end = exports.parseAngleOrPercentage(end))) {
            stops.push(`${colorOrHint} ${end}`);
          } else {
            return null;
          }
        }
      }
    }

    if (gradientType === 'linear') {
      let angle, position;
      if ((res = linearGradientConfigRegEx.exec(args[0]))) {
        if ((position = exports.parsePosition(res[1], linearGradientPositions))) {
          if (position === 'bottom') {
            args.shift();
          } else {
            config.push(`to ${position}`);
          }
        } else {
          return null;
        }
      } else if ((angle = exports.parseAngle(args[0]))) {
        if (angle === '180deg' || angle === 'calc(180deg)') {
          args.shift();
        } else {
          config.push(angle);
        }
      }
      if (config.length > 0) {
        args.shift();
        parsedArgs.push(config.join(' '));
      }

      for (let i = 0; i < args.length; i++) {
        const [stopOrHintArgs] = exports.splitTokens(args[i]);

        if (stopOrHintArgs.length > 3) {
          return null;
        }

        let [colorOrHint, start, end] = stopOrHintArgs;

        if ((colorOrHint = exports.parseLengthOrPercentage(colorOrHint))) {
          if (prevArgType !== 'color' || stopOrHintArgs.length > 1) {
            return null;
          }
          prevArgType = 'hint';
          stops.push(colorOrHint);
          continue;
        }

        const stopArgs = [];

        if ((colorOrHint = exports.parseColor(stopOrHintArgs[0]))) {
          prevArgType = 'color';
          stopArgs.push(colorOrHint);
        } else {
          return null;
        }
        if (start) {
          if ((start = exports.parseLengthOrPercentage(start))) {
            stopArgs.push(start);
          } else {
            return null;
          }
        }
        stops.push(stopArgs.join(' '));
        if (end) {
          if ((end = exports.parseLengthOrPercentage(end))) {
            stops.push(`${colorOrHint} ${end}`);
          } else {
            return null;
          }
        }
      }
    }

    if (gradientType === 'radial') {
      let shape;
      let size;
      let startPosition;
      if ((res = radialGradientConfigRegEx1.exec(args[0]))) {
        startPosition = res[3];
        args[0] = res[2];
        res = null;
      }
      if (!res && args[0]) {
        if ((res = radialGradientConfigRegEx2.exec(args[0]))) {
          shape = res[3];
          size = res[2];
        } else if ((res = radialGradientConfigRegEx3.exec(args[0]))) {
          shape = res[1];
          size = res[2];
        } else if (exports.splitTokens(args[0])[0].every(v => !exports.parseColor(v))) {
          size = args[0];
        }
      }
      if (shape === 'circle') {
        config.push('circle');
      }
      if (size) {
        shape = shape || 'circle';
        const [sizes] = exports.splitTokens(size);
        const { length: sizesLength } = sizes;
        const parsedSizes = [];
        for (let i = 0; i < sizesLength; i++) {
          let component = sizes[i];
          if (/^(closest|farthest)-(corner|side)$/.test(component)) {
            if (i === 0 && sizesLength === 1) {
              parsedSizes.push(component);
              continue;
            }
          } else if (shape === 'circle') {
            component = exports.parseLength(component);
            if (component && i === 0 && sizesLength === 1) {
              if (!startPosition) {
                config.shift(); // Remove 'circle'
              }
              parsedSizes.push([component]);
              continue;
            }
          } else if (shape === 'ellipse') {
            component = exports.parseLengthOrPercentage(component);
            if (component && sizesLength === 2) {
              parsedSizes.push(component);
              continue;
            }
          }
          return null;
        }
        if (parsedSizes.length > 0) {
          config.push(parsedSizes.join(' '));
        }
      }
      if (startPosition) {
        if ((startPosition = exports.parsePosition(startPosition))) {
          config.push(`at ${startPosition}`);
        } else {
          return null;
        }
      }
      if (config.length > 0 || shape === 'ellipse') {
        args.shift();
      }
      const parsedConfig = config.filter(value => value !== 'farthest-corner').join(' ');
      if (parsedConfig) {
        parsedArgs.push(parsedConfig);
      }

      for (let i = 0; i < args.length; i++) {
        const [stopOrHintArgs] = exports.splitTokens(args[i]);

        if (stopOrHintArgs.length > 3) {
          return null;
        }

        let [colorOrHint, start, end] = stopOrHintArgs;

        if ((colorOrHint = exports.parseLengthOrPercentage(colorOrHint))) {
          if (prevArgType !== 'color' || stopOrHintArgs.length > 1) {
            return null;
          }
          prevArgType = 'hint';
          stops.push(colorOrHint);
          continue;
        }

        const stopArgs = [];

        if ((colorOrHint = exports.parseColor(stopOrHintArgs[0]))) {
          prevArgType = 'color';
          stopArgs.push(colorOrHint);
        } else {
          return null;
        }
        if (start) {
          if ((start = exports.parseLengthOrPercentage(start))) {
            stopArgs.push(start);
          } else {
            return null;
          }
        }
        stops.push(stopArgs.join(' '));
        if (end) {
          if ((end = exports.parseLengthOrPercentage(end))) {
            stops.push(`${colorOrHint} ${end}`);
          } else {
            return null;
          }
        }
      }
    }

    if (stops.length < 2) {
      return null;
    }

    return `${repeating}${gradientType}-gradient(${parsedArgs.concat(stops).join(', ')})`;
  }

  return null;
};

/**
 * @param {string} val
 * @param {array} validPositions - [horizontal, vertical, initial?]
 * @return {string | null}
 *
 * https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
exports.parsePosition = function parsePosition(val, validPositions = positions) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  const [horizontal, vertical, initial = ''] = validPositions;
  let [components] = exports.splitTokens(val);

  // <horizontal> <calc-length-percentage> <vertical> <calc-length-percentage>
  if (components.length === 4) {
    return components.reduce((position, value, index) => {
      if (position === null) {
        return null;
      }
      if (index % 2) {
        if ((value = exports.parseLengthOrPercentage(value))) {
          return `${position} ${value}`;
        }
      } else if (index === 0) {
        if ((value = exports.parseKeyword(value, horizontal))) {
          return value;
        }
      } else if (index === 2) {
        if ((value = exports.parseKeyword(value, vertical))) {
          return `${position} ${value}`;
        }
      }
    }, '');
  }
  if (components.length > 2) {
    return null;
  }

  /**
   * -- x y
   * <horizontal> <center>
   * <horizontal> <vertical>
   * <center> <center>
   * <center> <vertical>
   * <calc-length-percentage> <center>
   * <calc-length-percentage> <vertical>
   * <horizontal> <calc-length-percentage>
   * <center> <calc-length-percentage>
   * <calc-length-percentage> <calc-length-percentage>
   * --- y x
   * <vertical> <center>
   * <vertical> <horizontal>
   */
  let [x, y = initial] = components;
  let parsedX =
    exports.parseLengthOrPercentage(x) || exports.parseKeyword(x, horizontal.concat(initial));
  let parsedY =
    exports.parseLengthOrPercentage(y) || exports.parseKeyword(y, vertical.concat(initial));
  const separator = y ? ' ' : '';
  if (parsedX && parsedY !== null) {
    return parsedX + separator + parsedY;
  }
  parsedX = exports.parseKeyword(x, vertical);
  parsedY = exports.parseKeyword(y, horizontal.concat(initial));
  if (parsedX && parsedY !== null) {
    return parsedY + separator + parsedX;
  }

  return null;
};

/**
 * https://drafts.csswg.org/css-shapes-1/#supported-basic-shapes
 * https://drafts.csswg.org/cssom/#ref-for-value-def-shape
 *
 * Used for `clip-path`, `offset-path`, and `shape-outside`.
 *
 * <resource> | [<basic-shape> || <geometry-box>] | none
 */
exports.parseBasicShape = function parseBasicShape(val) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  const resource = exports.parseResource(val);
  if (resource) {
    return resource;
  }

  const shapeRegEx = new RegExp(`^(circle|ellipse|inset|path|polygon)\\(${ws}(.*)${ws}\\)$`, 'i');
  let res = shapeRegEx.exec(val);
  if (res) {
    const [, fn, stringArgs] = res;
    const parsedArgs = [];

    /**
     * circle(<shape-radius>? [at <position>]?)
     *
     * <shape-radius> should be positive <length-percentage>, closest-side, or
     * farthest-side.
     * <shape-radius> is in browsers resolved value only if user defined.
     * <position> default to 50% 50% in Chrome.
     * <position> default to center center in Firefox.
     */
    if (fn === 'circle') {
      const circleRegEx1 = new RegExp(`^(.+)${whitespace}+(at${whitespace}+(.+))?$`, 'i');
      const circleRegEx2 = new RegExp(`^at${whitespace}+(.+)$`, 'i');
      let radius;
      let position;

      if ((res = circleRegEx1.exec(stringArgs))) {
        [, radius, , position = ''] = res;
      } else if ((res = circleRegEx2.exec(stringArgs))) {
        [, position] = res;
      } else {
        radius = stringArgs;
      }
      if (radius) {
        radius =
          exports.parseLengthOrPercentage(radius, false, true) ||
          exports.parseKeyword(radius, ['closest-side', 'farthest-side']);
        if (radius === null) {
          return null;
        }
        parsedArgs.push(radius);
      }
      if (position) {
        position = exports.parsePosition(position);
        if (position === null) {
          return null;
        }
        parsedArgs.push('at', position);
      } else {
        parsedArgs.push('at center center');
      }
      return `circle(${parsedArgs.join(' ')})`;
    }

    /**
     * ellipse(<shape-radius>{2}? [at <position>]?)
     *
     * <shape-radius> should be positive <length-percentage>, closest-side, or
     * farthest-side.
     * <shape-radius> is in browsers resolved value only if user defined.
     * <position> default to 50% 50% in Chrome.
     * <position> default to center center in Firefox.
     */
    if (fn === 'ellipse') {
      const circleRegEx1 = new RegExp(`^(.+)${whitespace}+(at${whitespace}+(.+))?$`, 'i');
      const circleRegEx2 = new RegExp(`^at${whitespace}+(.+)$`, 'i');
      let radii;
      let position;

      if ((res = circleRegEx1.exec(stringArgs))) {
        [, radii, , position = ''] = res;
      } else if ((res = circleRegEx2.exec(stringArgs))) {
        [, position] = res;
      } else {
        radii = stringArgs;
      }
      if (radii) {
        [radii] = exports.splitTokens(radii);
        if (radii.length !== 2) {
          return null;
        }
        let [rx, ry] = radii;
        rx =
          exports.parseLengthOrPercentage(rx, false, true) ||
          exports.parseKeyword(rx, ['closest-side', 'farthest-side']);
        ry =
          exports.parseLengthOrPercentage(ry, false, true) ||
          exports.parseKeyword(ry, ['closest-side', 'farthest-side']);
        if (!(rx && ry)) {
          return null;
        }
        parsedArgs.push(rx, ry);
      }
      if (position) {
        position = exports.parsePosition(position);
        if (position === null) {
          return null;
        }
        parsedArgs.push('at', exports.parsePosition(position));
      } else {
        parsedArgs.push('at center center');
      }
      return `ellipse(${parsedArgs.join(' ')})`;
    }

    /**
     * inset(<length-percentage>{1,4} [round <border-radius>]?)
     */
    if (fn === 'inset') {
      const insetRegEx = new RegExp(`^(.+)${whitespace}+round${whitespace}+(.+)$`, 'i');
      let corners;
      let radii;

      if ((res = insetRegEx.exec(stringArgs))) {
        [, corners, radii] = res;
      } else {
        corners = stringArgs;
      }

      [corners] = exports.splitTokens(corners);
      const { length: cornerLength } = corners;

      if (
        cornerLength > 4 ||
        !corners.every((corner, i) => (corners[i] = exports.parseLengthOrPercentage(corner)))
      ) {
        return null;
      }
      corners = corners.filter((corner, i) => {
        if (i > 1) {
          return corner !== corners[i - 2];
        }
        if (i === 1) {
          return corner !== corners[i - 1];
        }
        return true;
      });
      parsedArgs.push(corners.join(' '));
      if (radii) {
        radii = exports.parseBorderRadius(radii);
        if (radii === null) {
          return null;
        }
        if (radii !== '0%' && radii !== '0px') {
          parsedArgs.push('round', radii);
        }
      }
      return `inset(${parsedArgs.join(' ')})`;
    }

    /**
     * path([<fill-rule>,]? <string>)
     *
     * TODO: validate <string> as a valid path definition.
     */
    if (fn === 'path') {
      const [args] = exports.splitTokens(stringArgs, /,/);
      if (args.length === 2) {
        const fill = exports.parseKeyword(args[0], ['evenodd', 'nonzero']);
        const string = exports.parseString(args[1]);
        if (!(fill && string)) {
          return null;
        }
        parsedArgs.push(fill, string);
      } else if (args.length === 1) {
        const string = exports.parseString(args[0]);
        if (!string) {
          return null;
        }
        parsedArgs.push(string);
      }
      return `path(${parsedArgs.join(', ')})`;
    }

    /**
     * polygon(<fill-rule>?, <length-percentage>{2}+)
     */
    if (fn === 'polygon') {
      const [args] = exports.splitTokens(stringArgs, /,/);
      if (args.length > 2) {
        return null;
      }
      if (args.length === 2) {
        const fill = exports.parseKeyword(args.shift(), ['evenodd', 'nonzero']);
        if (!fill) {
          return null;
        }
        parsedArgs.push(fill);
      }
      const [vertices] = exports.splitTokens(args.shift());
      if (
        vertices.length % 2 ||
        !vertices.every((vertex, i) => (vertices[i] = exports.parseLengthOrPercentage(vertex)))
      ) {
        return null;
      }
      parsedArgs.push(vertices.join(' '));
      return `polygon(${parsedArgs.join(', ')})`;
    }
  }

  return null;
};

/**
 * @param {array} parts [horizontal radii, vertical radii]
 * @returns {string}
 *
 * Browsers serialize <border-radius> to its minimal expression.
 */
exports.serializeBorderRadius = function serializeBorderRadius(parsed) {
  return parsed
    .reduce((parts, components, index) => {
      if (components.length === 4 && components[3] === components[1]) {
        components.pop();
      }
      if (components.length === 3 && components[2] === components[0]) {
        components.pop();
      }
      if (components.length === 2 && components[1] === components[0]) {
        components.pop();
      }
      if (components.length === 1 && index === 1 && components[0] === parts[0][0]) {
        return parts;
      }
      return parts.concat([components]);
    }, [])
    .reduce((parts, component) => {
      const part = component.join(' ');
      if (part) {
        parts.push(part);
      }
      return parts;
    }, [])
    .join(' / ');
};

/**
 * https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius
 *
 * Used for `border-radius` and as an argument of the inset() <basic-shape>.
 */
exports.parseBorderRadius = function parseBorderRadius(val, serialize = true) {
  const variable = exports.parseCustomVariable(val);
  if (variable) {
    return variable;
  }

  const parsed = [];
  const [parts] = exports.splitTokens(val, /\//);

  if (parts.length > 2) {
    return null;
  }

  const [horizontal, vertical] = parts.map(part => exports.splitTokens(part)[0]);

  if (!horizontal.every((radius, i) => (horizontal[i] = exports.parseLengthOrPercentage(radius)))) {
    return null;
  }
  const [h1, h2 = h1, h3 = h1, h4 = h2] = horizontal;
  parsed.push([h1, h2, h3, h4]);

  if (vertical) {
    if (!vertical.every((radius, i) => (vertical[i] = exports.parseLengthOrPercentage(radius)))) {
      return null;
    }
    const [v1 = h1, v2 = v1, v3 = v1, v4 = v2] = vertical;
    parsed.push([v1, v2, v3, v4]);
  }

  if (serialize) {
    return exports.serializeBorderRadius(parsed);
  }
  return parsed;
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
