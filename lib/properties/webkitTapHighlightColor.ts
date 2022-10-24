import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-tap-highlight-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-tap-highlight-color');
  },
  enumerable: true,
  configurable: true,
};
