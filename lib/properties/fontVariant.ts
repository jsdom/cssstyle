import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const valid_variants = ['normal', 'small-caps', 'inherit'];

export function isValid(v: unknown): boolean {
  return typeof v === 'string' && valid_variants.indexOf(v.toLowerCase()) !== -1;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('font-variant', v);
  },
  get: function () {
    return this.getPropertyValue('font-variant');
  },
  enumerable: true,
  configurable: true,
};
