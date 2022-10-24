import { parseMeasurement } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('left', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('left');
  },
  enumerable: true,
  configurable: true,
};
