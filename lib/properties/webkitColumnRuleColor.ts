import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-column-rule-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-column-rule-color');
  },
  enumerable: true,
  configurable: true,
};
