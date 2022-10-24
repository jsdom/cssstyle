import { TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

function parse(v: unknown): string | undefined {
  const type = valueType(v);
  if (
    type.kind === TYPES.KEYWORD &&
    (type.value.toLowerCase() === 'repeat' ||
      type.value.toLowerCase() === 'repeat-x' ||
      type.value.toLowerCase() === 'repeat-y' ||
      type.value.toLowerCase() === 'no-repeat' ||
      type.value.toLowerCase() === 'inherit')
  ) {
    return type.value;
  }
  return undefined;
}

export function isValid(v: unknown): v is string {
  return parse(v) !== undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('background-repeat', parse(v));
  },
  get: function () {
    return this.getPropertyValue('background-repeat');
  },
  enumerable: true,
  configurable: true,
};
