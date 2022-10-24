import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('color');
  },
  enumerable: true,
  configurable: true,
};
