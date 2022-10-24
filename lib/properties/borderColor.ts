import { implicitSetter, TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export function isValid(v: unknown): v is string {
  if (typeof v !== 'string') {
    return false;
  }
  return v === '' || v.toLowerCase() === 'transparent' || valueType(v).kind === TYPES.COLOR;
}

function parser(v: unknown): string | undefined {
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: implicitSetter('border', 'color', isValid, parser),
  get: function () {
    return this.getPropertyValue('border-color');
  },
  enumerable: true,
  configurable: true,
};
