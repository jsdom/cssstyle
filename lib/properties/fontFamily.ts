// const TYPES = require('../parsers').TYPES;
// const valueType = require('../parsers').valueType;

import { TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const partsRegEx = /\s*,\s*/;

export function isValid(v: unknown): boolean {
  if (v === '' || v === null) {
    return true;
  }
  if (typeof v !== 'string') {
    return false;
  }
  const parts = v.split(partsRegEx);
  const len = parts.length;
  let i;
  let type;
  for (i = 0; i < len; i++) {
    type = valueType(parts[i]);
    if (type.kind === TYPES.STRING || type.kind === TYPES.KEYWORD) {
      return true;
    }
  }
  return false;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('font-family', v);
  },
  get: function () {
    return this.getPropertyValue('font-family');
  },
  enumerable: true,
  configurable: true,
};
