import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('stop-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('stop-color');
  },
  enumerable: true,
  configurable: true,
};
