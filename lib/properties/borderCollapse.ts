import { TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

type BorderCollapse = 'collapse' | 'separate' | 'inherit';
function parse(v: unknown): BorderCollapse | undefined {
  const type = valueType(v);
  if (type.kind === TYPES.KEYWORD) {
    const lowercase = type.value.toLowerCase();
    if (lowercase === 'collapse' || lowercase === 'separate' || lowercase === 'inherit') {
      return lowercase;
    }
  }
  return undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('border-collapse', parse(v));
  },
  get: function () {
    return this.getPropertyValue('border-collapse');
  },
  enumerable: true,
  configurable: true,
};
