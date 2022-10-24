import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-border-end-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-border-end-color');
  },
  enumerable: true,
  configurable: true,
};
