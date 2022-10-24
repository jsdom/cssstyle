import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('lighting-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('lighting-color');
  },
  enumerable: true,
  configurable: true,
};
