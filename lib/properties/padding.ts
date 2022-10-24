import { implicitSetter, parseMeasurement, TYPES, valueType } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export function isValid(v: string): boolean {
  const type = valueType(v);
  return (
    type.kind === TYPES.LENGTH ||
    type.kind === TYPES.PERCENT ||
    (type.kind === TYPES.INTEGER && type.value === '0')
  );
}

export function parser(v: unknown): string | null | undefined {
  return parseMeasurement(v);
}

const mySetter = implicitSetter('padding', '', isValid, parser);
const myGlobal = implicitSetter(
  'padding',
  '',
  function () {
    return true;
  },
  function (v) {
    return v;
  }
);

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (typeof v === 'number') {
      v = String(v);
    }
    if (typeof v !== 'string') {
      return;
    }
    const V = v.toLowerCase();
    switch (V) {
      case 'inherit':
      case 'initial':
      case 'unset':
      case '':
        myGlobal.call(this, V);
        break;

      default:
        mySetter.call(this, v);
        break;
    }
  },
  get: function () {
    return this.getPropertyValue('padding');
  },
  enumerable: true,
  configurable: true,
};
