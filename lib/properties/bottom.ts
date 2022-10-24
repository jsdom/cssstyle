import { parseMeasurement } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('bottom', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('bottom');
  },
  enumerable: true,
  configurable: true,
};
