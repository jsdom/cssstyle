import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { parseUrl, TYPES, valueType } from '../parsers';

function parse(v: unknown): string | null | undefined {
  const parsed = parseUrl(v);
  if (parsed !== undefined) {
    return parsed;
  }
  const type = valueType(v);
  if (
    type.kind === TYPES.KEYWORD &&
    (type.value.toLowerCase() === 'none' || type.value.toLowerCase() === 'inherit')
  ) {
    return type.value;
  }
  return undefined;
}

export function isValid(v: unknown): boolean {
  return parse(v) !== undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('background-image', parse(v));
  },
  get: function () {
    return this.getPropertyValue('background-image');
  },
  enumerable: true,
  configurable: true,
};
