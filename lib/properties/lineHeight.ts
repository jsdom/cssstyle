import { TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export function isValid(v: string): boolean {
  const type = valueType(v);

  return (
    (type.kind === TYPES.KEYWORD &&
      (type.value.toLowerCase() === 'normal' || type.value.toLowerCase() === 'inherit')) ||
    type.kind === TYPES.NUMBER ||
    type.kind === TYPES.LENGTH ||
    type.kind === TYPES.PERCENT
  );
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('line-height', v);
  },
  get: function () {
    return this.getPropertyValue('line-height');
  },
  enumerable: true,
  configurable: true,
};
