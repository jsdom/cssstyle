import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('text-underline-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('text-underline-color');
  },
  enumerable: true,
  configurable: true,
};
