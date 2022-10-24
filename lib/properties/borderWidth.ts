// the valid border-widths:
import { implicitSetter, parseLength } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const widths = ['thin', 'medium', 'thick'];

export function isValid(v: unknown): v is string {
  const length = parseLength(v);
  if (length !== undefined) {
    return true;
  }
  if (typeof v !== 'string') {
    return false;
  }
  if (v === '') {
    return true;
  }
  if (widths.indexOf(v.toLowerCase()) === -1) {
    return false;
  }
  return true;
}

function parser(v: unknown): string | null | undefined {
  const length = parseLength(v);
  if (length !== undefined) {
    return length;
  }
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: implicitSetter('border', 'width', isValid, parser),
  get: function () {
    return this.getPropertyValue('border-width');
  },
  enumerable: true,
  configurable: true,
};
