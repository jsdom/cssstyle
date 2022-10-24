import { parseMeasurement } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('top', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('top');
  },
  enumerable: true,
  configurable: true,
};
