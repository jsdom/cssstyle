import { parseMeasurement } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('right', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('right');
  },
  enumerable: true,
  configurable: true,
};
