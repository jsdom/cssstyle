import { parseColor, TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

function parse(v: unknown): string | null | undefined {
  const parsed = parseColor(v);
  if (parsed !== undefined) {
    return parsed;
  }
  const type = valueType(v);
  if (
    type.kind === TYPES.KEYWORD &&
    (type.value.toLowerCase() === 'transparent' || type.value.toLowerCase() === 'inherit')
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
    const parsed = parse(v);
    if (parsed === undefined) {
      return;
    }
    this._setProperty('background-color', parsed);
  },
  get: function () {
    return this.getPropertyValue('background-color');
  },
  enumerable: true,
  configurable: true,
};
