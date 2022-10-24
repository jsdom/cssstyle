import * as flexGrow from './flexGrow';
import * as flexShrink from './flexShrink';
import * as flexBasis from './flexBasis';
import { shorthandGetter, shorthandParser, shorthandSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const shorthand_for = {
  'flex-grow': flexGrow,
  'flex-shrink': flexShrink,
  'flex-basis': flexBasis,
};

const myShorthandSetter = shorthandSetter('flex', shorthand_for);

export function isValid(v: unknown) {
  return shorthandParser(v, shorthand_for) !== undefined;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    const normalizedValue = String(v).trim().toLowerCase();

    if (normalizedValue === 'none') {
      myShorthandSetter.call(this, '0 0 auto');
      return;
    }
    if (normalizedValue === 'initial') {
      myShorthandSetter.call(this, '0 1 auto');
      return;
    }
    if (normalizedValue === 'auto') {
      this.removeProperty('flex-grow');
      this.removeProperty('flex-shrink');
      this.setProperty('flex-basis', normalizedValue);
      return;
    }

    myShorthandSetter.call(this, v);
  },
  get: shorthandGetter('flex', shorthand_for),
  enumerable: true,
  configurable: true,
};
