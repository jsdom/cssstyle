import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('outline-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('outline-color');
  },
  enumerable: true,
  configurable: true,
};
