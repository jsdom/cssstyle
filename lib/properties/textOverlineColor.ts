import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('text-overline-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('text-overline-color');
  },
  enumerable: true,
  configurable: true,
};
