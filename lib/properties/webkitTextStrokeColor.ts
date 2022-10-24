import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-text-stroke-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-text-stroke-color');
  },
  enumerable: true,
  configurable: true,
};
