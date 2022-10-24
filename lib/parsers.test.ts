import * as parsers from './parsers';
import { ValueType } from './parsers';

describe('valueType', () => {
  it('returns color for red', () => {
    const input = 'red';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for #nnnnnn', () => {
    const input = '#fefefe';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for rgb(n, n, n)', () => {
    const input = 'rgb(10, 10, 10)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for rgb(p, p, p)', () => {
    const input = 'rgb(10%, 10%, 10%)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for rgba(n, n, n, n)', () => {
    const input = 'rgba(10, 10, 10, 1)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for rgba(n, n, n, n) with decimal alpha', () => {
    const input = 'rgba(10, 10, 10, 0.5)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for rgba(p, p, p, n)', () => {
    const input = 'rgba(10%, 10%, 10%, 1)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns color for rgba(p, p, p, n) with decimal alpha', () => {
    const input = 'rgba(10%, 10%, 10%, 0.5)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.COLOR, value: input });
  });

  it('returns length for 100ch', () => {
    const input = '100ch';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.LENGTH, value: input });
  });

  it('returns calc from calc(100px * 2)', () => {
    const input = 'calc(100px * 2)';
    const output = parsers.valueType(input);

    expect(output).toEqual<ValueType>({ kind: parsers.TYPES.CALC, value: input });
  });
});
describe('parseInteger', () => {
  it.todo('test');
});
describe('parseNumber', () => {
  it.todo('test');
});
describe('parseLength', () => {
  it.todo('test');
});
describe('parsePercent', () => {
  it.todo('test');
});
describe('parseMeasurement', () => {
  it.todo('test');
});
describe('parseUrl', () => {
  it.todo('test');
});
describe('parseString', () => {
  it.todo('test');
});
describe('parseColor', () => {
  it('should convert hsl to rgb values', () => {
    const input = 'hsla(0, 1%, 2%)';
    const output = parsers.parseColor(input);

    expect(output).toEqual('rgb(5, 5, 5)');
  });
  it('should convert hsla to rgba values', () => {
    const input = 'hsla(0, 1%, 2%, 0.5)';
    const output = parsers.parseColor(input);

    expect(output).toEqual('rgba(5, 5, 5, 0.5)');
  });

  it.todo('Add more tests');
});
describe('parseAngle', () => {
  it.todo('test');
});
describe('parseKeyword', () => {
  it.todo('test');
});
describe('dashedToCamelCase', () => {
  it.todo('test');
});
describe('shorthandParser', () => {
  it.todo('test');
});
describe('shorthandSetter', () => {
  it.todo('test');
});
describe('shorthandGetter', () => {
  it.todo('test');
});
describe('implicitSetter', () => {
  it.todo('test');
});
describe('subImplicitSetter', () => {
  it.todo('test');
});
describe('camelToDashed', () => {
  it.todo('test');
});
