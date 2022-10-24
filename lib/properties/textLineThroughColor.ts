import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('text-line-through-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('text-line-through-color');
  },
  enumerable: true,
  configurable: true,
};
