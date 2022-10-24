import { implicitSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

// the valid border-styles:
const styles = [
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

export function isValid(v: unknown): v is string {
  return typeof v === 'string' && (v === '' || styles.indexOf(v) !== -1);
}

function parser(v: unknown): string | undefined {
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: implicitSetter('border', 'style', isValid, parser),
  get: function () {
    return this.getPropertyValue('border-style');
  },
  enumerable: true,
  configurable: true,
};
