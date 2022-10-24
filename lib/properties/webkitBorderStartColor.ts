import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-border-start-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-border-start-color');
  },
  enumerable: true,
  configurable: true,
};
