import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const valid_styles = ['normal', 'italic', 'oblique', 'inherit'];

export function isValid(v: unknown): boolean {
  if (typeof v !== 'string') {
    return false;
  }
  return valid_styles.indexOf(v.toLowerCase()) !== -1;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('font-style', v);
  },
  get: function () {
    return this.getPropertyValue('font-style');
  },
  enumerable: true,
  configurable: true,
};
