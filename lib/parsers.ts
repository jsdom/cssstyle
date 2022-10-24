/*********************************************************************
 * These are commonly used parsers for CSS Values they take a string *
 * to parse and return a string after it's been converted, if needed *
 ********************************************************************/

import namedColorsSource from './named_colors.json';

import { hslToRgb } from './utils/colorSpace';
import { BasicPropertyDescriptorThis } from './utils/getBasicPropertyDescriptor';

const namedColors: readonly unknown[] = namedColorsSource;

export const TYPES = {
  INTEGER: 1,
  NUMBER: 2,
  LENGTH: 3,
  PERCENT: 4,
  URL: 5,
  COLOR: 6,
  STRING: 7,
  ANGLE: 8,
  KEYWORD: 9,
  NULL_OR_EMPTY_STR: 10,
  CALC: 11,
  UNKNOWN: 12,
} as const;

export type ValueType =
  | { readonly kind: typeof TYPES.INTEGER; readonly value: string }
  | { readonly kind: typeof TYPES.NUMBER; readonly value: string }
  | { readonly kind: typeof TYPES.LENGTH; readonly value: string }
  | { readonly kind: typeof TYPES.PERCENT; readonly value: string }
  | { readonly kind: typeof TYPES.URL; readonly value: string }
  | { readonly kind: typeof TYPES.COLOR; readonly value: string }
  | { readonly kind: typeof TYPES.STRING; readonly value: string }
  | { readonly kind: typeof TYPES.ANGLE; readonly value: string }
  | { readonly kind: typeof TYPES.KEYWORD; readonly value: string }
  | { readonly kind: typeof TYPES.NULL_OR_EMPTY_STR; readonly value: '' | null }
  | { readonly kind: typeof TYPES.CALC; readonly value: string }
  | { readonly kind: typeof TYPES.UNKNOWN };

// rough regular expressions
const integerRegEx = /^[-+]?[0-9]+$/;
const numberRegEx = /^[-+]?[0-9]*\.?[0-9]+$/;
const lengthRegEx = /^(0|[-+]?[0-9]*\.?[0-9]+(in|cm|em|mm|pt|pc|px|ex|rem|vh|vw|ch))$/;
const percentRegEx = /^[-+]?[0-9]*\.?[0-9]+%$/;
const urlRegEx = /^url\(\s*([^)]*)\s*\)$/;
const stringRegEx = /^("[^"]*"|'[^']*')$/;
const colorRegEx1 = /^#([0-9a-fA-F]{3,4}){1,2}$/;
const colorRegEx2 = /^rgb\(([^)]*)\)$/;
const colorRegEx3 = /^rgba\(([^)]*)\)$/;
const calcRegEx = /^calc\(([^)]*)\)$/;
const colorRegEx4 =
  /^hsla?\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*(,\s*(-?\d+|-?\d*.\d+)\s*)?\)/;
const angleRegEx = /^([-+]?[0-9]*\.?[0-9]+)(deg|grad|rad)$/;

// This will return one of the above types based on the passed in string
export function valueType(value: unknown): ValueType {
  if (value === '' || value === null) {
    return { kind: TYPES.NULL_OR_EMPTY_STR, value: value };
  }
  if (typeof value === 'number') {
    value = value.toString();
  }

  if (typeof value !== 'string') {
    return { kind: TYPES.UNKNOWN };
  }

  if (integerRegEx.test(value)) {
    return { kind: TYPES.INTEGER, value };
  }
  if (numberRegEx.test(value)) {
    return { kind: TYPES.NUMBER, value };
  }
  if (lengthRegEx.test(value)) {
    return { kind: TYPES.LENGTH, value };
  }
  if (percentRegEx.test(value)) {
    return { kind: TYPES.PERCENT, value };
  }
  if (urlRegEx.test(value)) {
    return { kind: TYPES.URL, value };
  }
  if (calcRegEx.test(value)) {
    return { kind: TYPES.CALC, value };
  }
  if (stringRegEx.test(value)) {
    return { kind: TYPES.STRING, value };
  }
  if (angleRegEx.test(value)) {
    return { kind: TYPES.ANGLE, value };
  }
  if (colorRegEx1.test(value)) {
    return { kind: TYPES.COLOR, value };
  }

  let res = colorRegEx2.exec(value);
  let parts;
  if (res !== null) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 3) {
      return { kind: TYPES.UNKNOWN };
    }
    if (
      parts.every(percentRegEx.test.bind(percentRegEx)) ||
      parts.every(integerRegEx.test.bind(integerRegEx))
    ) {
      return { kind: TYPES.COLOR, value };
    }
    return { kind: TYPES.UNKNOWN };
  }
  res = colorRegEx3.exec(value);
  if (res !== null) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 4) {
      return { kind: TYPES.UNKNOWN };
    }
    if (
      parts.slice(0, 3).every(percentRegEx.test.bind(percentRegEx)) ||
      parts.slice(0, 3).every(integerRegEx.test.bind(integerRegEx))
    ) {
      if (numberRegEx.test(parts[3])) {
        return { kind: TYPES.COLOR, value };
      }
    }
    return { kind: TYPES.UNKNOWN };
  }

  if (colorRegEx4.test(value)) {
    return { kind: TYPES.COLOR, value };
  }

  // could still be a color, one of the standard keyword colors
  const lowerCaseValue = value.toLowerCase();

  if (namedColors.includes(lowerCaseValue)) {
    return { kind: TYPES.COLOR, value: lowerCaseValue };
  }

  switch (lowerCaseValue) {
    // the following are deprecated in CSS3
    case 'activeborder':
    case 'activecaption':
    case 'appworkspace':
    case 'background':
    case 'buttonface':
    case 'buttonhighlight':
    case 'buttonshadow':
    case 'buttontext':
    case 'captiontext':
    case 'graytext':
    case 'highlight':
    case 'highlighttext':
    case 'inactiveborder':
    case 'inactivecaption':
    case 'inactivecaptiontext':
    case 'infobackground':
    case 'infotext':
    case 'menu':
    case 'menutext':
    case 'scrollbar':
    case 'threeddarkshadow':
    case 'threedface':
    case 'threedhighlight':
    case 'threedlightshadow':
    case 'threedshadow':
    case 'window':
    case 'windowframe':
    case 'windowtext':
      return { kind: TYPES.COLOR, value: lowerCaseValue };
    default:
      return { kind: TYPES.KEYWORD, value: lowerCaseValue };
  }
}

export function parseInteger(val: unknown): string | null | undefined {
  const type = valueType(val);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.INTEGER) {
    return undefined;
  }
  return String(parseInt(type.value, 10));
}

export function parseNumber(val: unknown): string | null | undefined {
  const type = valueType(val);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.NUMBER && type.kind !== TYPES.INTEGER) {
    return undefined;
  }
  return String(parseFloat(type.value));
}

export function parseLength(val: unknown): string | null | undefined {
  if (val === 0 || val === '0') {
    return '0px';
  }
  const type = valueType(val);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.LENGTH) {
    return undefined;
  }
  return type.value;
}

export function parsePercent(val: unknown): string | null | undefined {
  if (val === 0 || val === '0') {
    return '0%';
  }
  const type = valueType(val);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.PERCENT) {
    return undefined;
  }
  return type.value;
}

// either a length or a percent
export function parseMeasurement(val: unknown): string | null | undefined {
  const type = valueType(val);
  if (type.kind === TYPES.CALC) {
    return type.value;
  }

  const length = parseLength(val);
  if (length !== undefined) {
    return length;
  }
  return parsePercent(val);
}

export function parseUrl(val: unknown): string | null | undefined {
  const type = valueType(val);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (typeof val !== 'string') {
    return undefined;
  }
  const res = urlRegEx.exec(val);
  // does it match the regex?
  if (!res) {
    return undefined;
  }
  let str = res[1];
  // if it starts with single or double quotes, does it end with the same?
  if ((str[0] === '"' || str[0] === "'") && str[0] !== str[str.length - 1]) {
    return undefined;
  }
  if (str[0] === '"' || str[0] === "'") {
    str = str.substr(1, str.length - 2);
  }

  let i;
  for (i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '(':
      case ')':
      case ' ':
      case '\t':
      case '\n':
      case "'":
      case '"':
        return undefined;
      case '\\':
        i++;
        break;
    }
  }

  return 'url(' + str + ')';
}

export function parseString(val: unknown): string | null | undefined {
  const type = valueType(val);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.STRING) {
    return undefined;
  }
  let i;
  for (i = 1; i < type.value.length - 1; i++) {
    switch (type.value[i]) {
      case type.value[0]:
        return undefined;
      case '\\':
        i++;
        while (i < type.value.length - 1 && /[0-9A-Fa-f]/.test(type.value[i])) {
          i++;
        }
        break;
    }
  }
  if (i >= type.value.length) {
    return undefined;
  }
  return type.value;
}

export function parseColor(value: unknown): string | null | undefined {
  const type = valueType(value);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind === TYPES.UNKNOWN) {
    return undefined;
  }
  const val = type.value;
  let red,
    green,
    blue,
    hue,
    saturation,
    lightness,
    alpha = 1;
  let parts;
  let res = colorRegEx1.exec(val);
  // is it #aaa, #ababab, #aaaa, #abababaa
  if (res) {
    const defaultHex = val.substr(1);
    let hex = val.substr(1);
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
      const hexAlpha = hex.substr(6, 2);
      const hexAlphaToRgbaAlpha = Number((parseInt(hexAlpha, 16) / 255).toFixed(3));

      return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + hexAlphaToRgbaAlpha + ')';
    }
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
  }

  res = colorRegEx2.exec(val);
  if (res) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 3) {
      return undefined;
    }
    if (parts.every(percentRegEx.test.bind(percentRegEx))) {
      red = Math.floor((parseFloat(parts[0].slice(0, -1)) * 255) / 100);
      green = Math.floor((parseFloat(parts[1].slice(0, -1)) * 255) / 100);
      blue = Math.floor((parseFloat(parts[2].slice(0, -1)) * 255) / 100);
    } else if (parts.every(integerRegEx.test.bind(integerRegEx))) {
      red = parseInt(parts[0], 10);
      green = parseInt(parts[1], 10);
      blue = parseInt(parts[2], 10);
    } else {
      return undefined;
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
      return undefined;
    }
    if (parts.slice(0, 3).every(percentRegEx.test.bind(percentRegEx))) {
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
      return undefined;
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
    const _alpha = parseFloat(_alphaString.replace(',', '').trim()).toString();
    if (!_hue || !_saturation || !_lightness) {
      return undefined;
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

  if (type.kind === TYPES.COLOR) {
    return type.value;
  }

  return undefined;
}

export function parseAngle(value: unknown): string | null | undefined {
  const type = valueType(value);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.ANGLE) {
    return undefined;
  }
  const val = type.value;
  const res = angleRegEx.exec(val);
  if (res === null) {
    return undefined;
  }
  let flt = parseFloat(res[1]);
  if (res[2] === 'rad') {
    flt *= 180 / Math.PI;
  } else if (res[2] === 'grad') {
    flt *= 360 / 400;
  }

  while (flt < 0) {
    flt += 360;
  }
  while (flt > 360) {
    flt -= 360;
  }
  return flt + 'deg';
}

export function parseKeyword(
  value: unknown,
  valid_keywords: readonly string[]
): string | null | undefined {
  const type = valueType(value);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    return type.value;
  }
  if (type.kind !== TYPES.KEYWORD) {
    return undefined;
  }
  const val = type.value.toString().toLowerCase();
  let i;
  for (i = 0; i < valid_keywords.length; i++) {
    if (valid_keywords[i].toLowerCase() === val) {
      return valid_keywords[i];
    }
  }
  return undefined;
}

// utility to translate from border-width to borderWidth
export function dashedToCamelCase(dashed: string): string {
  let i;
  let camel = '';
  let nextCap = false;
  for (i = 0; i < dashed.length; i++) {
    if (dashed[i] !== '-') {
      camel += nextCap ? dashed[i].toUpperCase() : dashed[i];
      nextCap = false;
    } else {
      nextCap = true;
    }
  }
  return camel;
}

const is_space = /\s/;
const opening_deliminators = ['"', "'", '('];
const closing_deliminators = ['"', "'", ')'];
// this splits on whitespace, but keeps quoted and parened parts together
function getParts(str: string): readonly string[] {
  const deliminator_stack = [];
  const length = str.length;
  let i;
  const parts: string[] = [];
  let current_part = '';
  let opening_index;
  let closing_index;
  for (i = 0; i < length; i++) {
    opening_index = opening_deliminators.indexOf(str[i]);
    closing_index = closing_deliminators.indexOf(str[i]);
    if (is_space.test(str[i])) {
      if (deliminator_stack.length === 0) {
        if (current_part !== '') {
          parts.push(current_part);
        }
        current_part = '';
      } else {
        current_part += str[i];
      }
    } else {
      if (str[i] === '\\') {
        i++;
        current_part += str[i];
      } else {
        current_part += str[i];
        if (
          closing_index !== -1 &&
          closing_index === deliminator_stack[deliminator_stack.length - 1]
        ) {
          deliminator_stack.pop();
        } else if (opening_index !== -1) {
          deliminator_stack.push(opening_index);
        }
      }
    }
  }
  if (current_part !== '') {
    parts.push(current_part);
  }
  return parts;
}

interface ShorthandForEntry {
  readonly isValid: (part: string, index: number) => boolean;
}
type ShorthandFor = Record<string, ShorthandForEntry>;
/*
 * this either returns undefined meaning that it isn't valid
 * or returns an object where the keys are dashed short
 * hand properties and the values are the values to set
 * on them
 */
export function shorthandParser(
  v: unknown,
  shorthand_for: ShorthandFor
): Record<string, unknown> | undefined {
  const obj: Record<string, string> = {};
  const type = valueType(v);
  if (type.kind === TYPES.NULL_OR_EMPTY_STR) {
    Object.keys(shorthand_for).forEach(function (property) {
      obj[property] = '';
    });
    return obj;
  }

  if (typeof v === 'number') {
    v = v.toString();
  }

  if (typeof v !== 'string') {
    return undefined;
  }

  if (v.toLowerCase() === 'inherit') {
    return {};
  }
  const parts = getParts(v);
  let valid = true;
  parts.forEach(function (part, i) {
    let part_valid = false;
    Object.keys(shorthand_for).forEach(function (property) {
      if (shorthand_for[property].isValid(part, i)) {
        part_valid = true;
        obj[property] = part;
      }
    });
    valid = valid && part_valid;
  });
  if (!valid) {
    return undefined;
  }
  return obj;
}

export function shorthandSetter(property: string, shorthand_for: ShorthandFor) {
  return function (this: BasicPropertyDescriptorThis, v: unknown): void {
    const obj = shorthandParser(v, shorthand_for);
    if (obj === undefined) {
      return;
    }
    //console.log('shorthandSetter for:', property, 'obj:', obj);
    Object.keys(obj).forEach(function (this: BasicPropertyDescriptorThis, subprop) {
      // in case subprop is an implicit property, this will clear
      // *its* subpropertiesX
      const camel = dashedToCamelCase(subprop);
      this[camel] = obj[subprop];
      // in case it gets translated into something else (0 -> 0px)
      obj[subprop] = this[camel];
      this.removeProperty(subprop);
      // don't add in empty properties
      if (obj[subprop] !== '') {
        this._values[subprop] = obj[subprop];
      }
    }, this);
    Object.keys(shorthand_for).forEach(function (this: BasicPropertyDescriptorThis, subprop) {
      if (!obj.hasOwnProperty(subprop)) {
        this.removeProperty(subprop);
        delete this._values[subprop];
      }
    }, this);
    // in case the value is something like 'none' that removes all values,
    // check that the generated one is not empty, first remove the property
    // if it already exists, then call the shorthandGetter, if it's an empty
    // string, don't set the property
    this.removeProperty(property);
    const calculated = shorthandGetter(property, shorthand_for).call(this);
    if (calculated !== '') {
      this._setProperty(property, calculated);
    }
  };
}

export function shorthandGetter(property: string, shorthand_for: ShorthandFor) {
  return function (this: BasicPropertyDescriptorThis): string {
    if (this._values[property] !== undefined) {
      return this.getPropertyValue(property);
    }
    return Object.keys(shorthand_for)
      .map(function (this: BasicPropertyDescriptorThis, subprop) {
        return this.getPropertyValue(subprop);
      }, this)
      .filter(function (value) {
        return value !== '';
      })
      .join(' ');
  };
}

// isValid(){1,4} | inherit
// if one, it applies to all
// if two, the first applies to the top and bottom, and the second to left and right
// if three, the first applies to the top, the second to left and right, the third bottom
// if four, top, right, bottom, left
export function implicitSetter(
  property_before: string,
  property_after: string,
  isValid: (value: string) => boolean,
  parser: (value: string) => string | null | undefined
) {
  property_after = property_after || '';
  if (property_after !== '') {
    property_after = '-' + property_after;
  }
  const part_names = ['top', 'right', 'bottom', 'left'];

  return function (this: BasicPropertyDescriptorThis, v: unknown): string | undefined {
    if (typeof v === 'number') {
      v = v.toString();
    }
    if (typeof v !== 'string') {
      return undefined;
    }
    let parts;
    if (v.toLowerCase() === 'inherit' || v === '') {
      parts = [v];
    } else {
      parts = getParts(v);
    }
    if (parts.length < 1 || parts.length > 4) {
      return undefined;
    }

    if (!parts.every(isValid)) {
      return undefined;
    }

    parts = parts.map(function (part) {
      return parser(part);
    });
    this._setProperty(property_before + property_after, parts.join(' '));
    if (parts.length === 1) {
      parts[1] = parts[0];
    }
    if (parts.length === 2) {
      parts[2] = parts[0];
    }
    if (parts.length === 3) {
      parts[3] = parts[1];
    }

    for (let i = 0; i < 4; i++) {
      const property = property_before + '-' + part_names[i] + property_after;
      this.removeProperty(property);
      if (parts[i] !== '') {
        this._values[property] = parts[i];
      }
    }
    return v;
  };
}

//
//  Companion to implicitSetter, but for the individual parts.
//  This sets the individual value, and checks to see if all four
//  sub-parts are set.  If so, it sets the shorthand version and removes
//  the individual parts from the cssText.
//
export function subImplicitSetter(
  prefix: string,
  part: string,
  isValid: (value: string) => boolean,
  parser: (value: string) => string | null | undefined
) {
  const property = prefix + '-' + part;
  const subparts = [prefix + '-top', prefix + '-right', prefix + '-bottom', prefix + '-left'];

  return function (this: BasicPropertyDescriptorThis, v: unknown): string | null | undefined {
    if (typeof v === 'number') {
      v = v.toString();
    }
    if (typeof v !== 'string') {
      return undefined;
    }
    if (!isValid(v)) {
      return undefined;
    }
    const parsed = parser(v);
    this._setProperty(property, parsed);
    const parts = [];
    for (let i = 0; i < 4; i++) {
      if (this._values[subparts[i]] == null || this._values[subparts[i]] === '') {
        break;
      }
      parts.push(this._values[subparts[i]]);
    }
    if (parts.length === 4) {
      for (let i = 0; i < 4; i++) {
        this.removeProperty(subparts[i]);
        this._values[subparts[i]] = parts[i];
      }
      this._setProperty(prefix, parts.join(' '));
    }
    return parsed;
  };
}

const camel_to_dashed = /[A-Z]/g;
const first_segment = /^\([^-]\)-/;
const vendor_prefixes = ['o', 'moz', 'ms', 'webkit'];
export function camelToDashed(camel_case: string): string {
  let dashed = camel_case.replace(camel_to_dashed, '-$&').toLowerCase();
  const match = dashed.match(first_segment);
  if (match && vendor_prefixes.indexOf(match[1]) !== -1) {
    dashed = '-' + dashed;
  }
  return dashed;
}
