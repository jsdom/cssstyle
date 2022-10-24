import { parseMeasurement } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const shape_regex = /^rect\((.*)\)$/i;

function parse(val: unknown): string | null | undefined {
  if (val === '' || val === null) {
    return val;
  }
  if (typeof val !== 'string') {
    return undefined;
  }
  const lowerCase = val.toLowerCase();
  if (lowerCase === 'auto' || lowerCase === 'inherit') {
    return lowerCase;
  }
  const matches = lowerCase.match(shape_regex);
  if (!matches) {
    return undefined;
  }
  const parts = matches[1].split(/\s*,\s*/);
  if (parts.length !== 4) {
    return undefined;
  }
  const valid = parts.every(function (part, index) {
    const measurement = parseMeasurement(part);
    const isValid = measurement !== undefined && measurement !== null;
    if (isValid) {
      parts[index] = measurement;
    }
    return isValid;
  });
  if (!valid) {
    return undefined;
  }
  return lowerCase.replace(matches[1], parts.join(', '));
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('clip', parse(v));
  },
  get: function () {
    return this.getPropertyValue('clip');
  },
  enumerable: true,
  configurable: true,
};
