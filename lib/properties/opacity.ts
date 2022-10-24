import { parseNumber } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('opacity', parseNumber(v));
  },
  get: function () {
    return this.getPropertyValue('opacity');
  },
  enumerable: true,
  configurable: true,
};
