// <length> <length>? | inherit
// if one, it applies to both horizontal and verical spacing
// if two, the first applies to the horizontal and the second applies to vertical spacing

import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

function parse(v: unknown): string | undefined {
  if (v === '' || v === null) {
    return undefined;
  }
  if (v === 0) {
    return '0px';
  }
  if (typeof v !== 'string') {
    return undefined;
  }
  if (v.toLowerCase() === 'inherit') {
    return v;
  }
  const parts = v.split(/\s+/);
  if (parts.length !== 1 && parts.length !== 2) {
    return undefined;
  }

  return v;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('border-spacing', parse(v));
  },
  get: function () {
    return this.getPropertyValue('border-spacing');
  },
  enumerable: true,
  configurable: true,
};
