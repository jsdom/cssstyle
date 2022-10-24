import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-text-emphasis-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-text-emphasis-color');
  },
  enumerable: true,
  configurable: true,
};
