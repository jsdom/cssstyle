import { TYPES, ValueType, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const valid_keywords = ['top', 'center', 'bottom', 'left', 'right'];

function parse(v: unknown): string | undefined {
  if (v === '' || v === null || typeof v !== 'string') {
    return undefined;
  }
  const parts = v.split(/\s+/);
  if (parts.length > 2 || parts.length < 1) {
    return undefined;
  }
  const types: ValueType[] = [];
  parts.forEach(function (part, index) {
    types[index] = valueType(part);
  });
  if (parts.length === 1) {
    if (types[0].kind === TYPES.LENGTH || types[0].kind === TYPES.PERCENT) {
      return v;
    }
    if (types[0].kind === TYPES.KEYWORD) {
      if (valid_keywords.indexOf(v.toLowerCase()) !== -1 || v.toLowerCase() === 'inherit') {
        return v;
      }
    }
    return undefined;
  }
  if (
    (types[0].kind === TYPES.LENGTH || types[0].kind === TYPES.PERCENT) &&
    (types[1].kind === TYPES.LENGTH || types[1].kind === TYPES.PERCENT)
  ) {
    return v;
  }
  if (types[0].kind !== TYPES.KEYWORD || types[1].kind !== TYPES.KEYWORD) {
    return undefined;
  }
  if (valid_keywords.indexOf(parts[0]) !== -1 && valid_keywords.indexOf(parts[1]) !== -1) {
    return v;
  }
  return undefined;
}

export function isValid(v: string): boolean {
  return parse(v) !== undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('background-position', parse(v));
  },
  get: function () {
    return this.getPropertyValue('background-position');
  },
  enumerable: true,
  configurable: true,
};
