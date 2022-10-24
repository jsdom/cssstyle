import { parseMeasurement } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

function parse(v: unknown): string | null | undefined {
  if (String(v).toLowerCase() === 'auto') {
    return 'auto';
  }
  if (String(v).toLowerCase() === 'inherit') {
    return 'inherit';
  }
  return parseMeasurement(v);
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('width', parse(v));
  },
  get: function () {
    return this.getPropertyValue('width');
  },
  enumerable: true,
  configurable: true,
};
