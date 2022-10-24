import { parseMeasurement, TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const absoluteSizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
const relativeSizes = ['larger', 'smaller'];

export function isValid(v: unknown): boolean {
  if (typeof v !== 'string') {
    return false;
  }
  const type = valueType(v.toLowerCase());
  return (
    type.kind === TYPES.LENGTH ||
    type.kind === TYPES.PERCENT ||
    (type.kind === TYPES.KEYWORD && absoluteSizes.indexOf(type.value.toLowerCase()) !== -1) ||
    (type.kind === TYPES.KEYWORD && relativeSizes.indexOf(type.value.toLowerCase()) !== -1)
  );
}

function parse(v: unknown): string | null | undefined {
  const valueAsString = String(v).toLowerCase();
  const optionalArguments = absoluteSizes.concat(relativeSizes);
  const isOptionalArgument = optionalArguments.some(
    (stringValue) => stringValue.toLowerCase() === valueAsString
  );
  return isOptionalArgument ? valueAsString : parseMeasurement(v);
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('font-size', parse(v));
  },
  get: function () {
    return this.getPropertyValue('font-size');
  },
  enumerable: true,
  configurable: true,
};
