import { POSITION_AT_SHORTHAND } from '../constants';
import { parseNumber } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export function isValid(v: unknown, positionAtFlexShorthand?: unknown) {
  return parseNumber(v) !== undefined && positionAtFlexShorthand === POSITION_AT_SHORTHAND.first;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('flex-grow', parseNumber(v));
  },
  get: function () {
    return this.getPropertyValue('flex-grow');
  },
  enumerable: true,
  configurable: true,
};
