import { TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

type BackgroundAttachment = 'scroll' | 'fixed' | 'inherit';
export function isValid(v: unknown): v is BackgroundAttachment {
  const type = valueType(v);
  return (
    type.kind === TYPES.KEYWORD &&
    (type.value.toLowerCase() === 'scroll' ||
      type.value.toLowerCase() === 'fixed' ||
      type.value.toLowerCase() === 'inherit')
  );
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (!isValid(v)) {
      return;
    }
    this._setProperty('background-attachment', v);
  },
  get: function () {
    return this.getPropertyValue('background-attachment');
  },
  enumerable: true,
  configurable: true,
};
