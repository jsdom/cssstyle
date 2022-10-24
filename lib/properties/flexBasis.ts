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

export function isValid(v: unknown): boolean {
  return parse(v) !== undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('flex-basis', parse(v));
  },
  get: function () {
    return this.getPropertyValue('flex-basis');
  },
  enumerable: true,
  configurable: true,
};
