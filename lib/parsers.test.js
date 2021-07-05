'use strict';

const parsers = require('./parsers');

describe('valueType', () => {
  it('returns color for red', () => {
    let input = 'red';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for #nnnnnn', () => {
    let input = '#fefefe';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for rgb(n, n, n)', () => {
    let input = 'rgb(10, 10, 10)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for rgb(p, p, p)', () => {
    let input = 'rgb(10%, 10%, 10%)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for rgba(n, n, n, n)', () => {
    let input = 'rgba(10, 10, 10, 1)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for rgba(n, n, n, n) with decimal alpha', () => {
    let input = 'rgba(10, 10, 10, 0.5)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for rgba(p, p, p, n)', () => {
    let input = 'rgba(10%, 10%, 10%, 1)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns color for rgba(p, p, p, n) with decimal alpha', () => {
    let input = 'rgba(10%, 10%, 10%, 0.5)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.COLOR);
  });

  it('returns length for 100ch', () => {
    let input = '100ch';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.LENGTH);
  });

  it('returns calc from calc(100px * 2)', () => {
    let input = 'calc(100px * 2)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.CALC);
  });

  it('returns calc from calc(100px * (6 - 4))', () => {
    let input = 'calc(100px * (6 - 4))';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.CALC);
  });

  it('returns variable from var(--value)', () => {
    let input = 'var(--value)';
    let output = parsers.valueType(input);

    expect(output).toEqual(parsers.TYPES.VARIABLE);
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
  it('accepts px', () => {
    let input = '15px';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual('15px');
  });
  it('accepts percent', () => {
    let input = '15%';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual('15%');
  });
  it('defaults to undefined', () => {
    let input = '15';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual(undefined);
  });
  it('accepts zero without unit', () => {
    let input = '0';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual('0px');
  });
  it('rejects other unit', () => {
    let input = '15deg';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual(undefined);
  });
  it('keeps value definition starting with calc', () => {
    let input = 'calc(100% / 4)';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual('calc(100% / 4)');
  });
  it('keeps value definition starting with var', () => {
    let input = 'var(--value)';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual('var(--value)');
  });
  it('keeps value definition combining calc and var', () => {
    let input = 'calc((20 - 18) * 2 * var(--value))';
    let output = parsers.parseMeasurement(input);

    expect(output).toEqual('calc((20 - 18) * 2 * var(--value))');
  });

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
    let input = 'hsla(0, 1%, 2%)';
    let output = parsers.parseColor(input);

    expect(output).toEqual('rgb(5, 5, 5)');
  });
  it('should convert hsla to rgba values', () => {
    let input = 'hsla(0, 1%, 2%, 0.5)';
    let output = parsers.parseColor(input);

    expect(output).toEqual('rgba(5, 5, 5, 0.5)');
  });
  it('should keep value definition when it starts with var', () => {
    let input = 'var(--value)';
    let output = parsers.parseColor(input);

    expect(output).toEqual('var(--value)');
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
