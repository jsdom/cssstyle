"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const parsers = require("../lib/parsers");

describe("prepareValue", () => {
  it("should return empty string for null", () => {
    const input = null;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "");
  });

  it("should return string for string", () => {
    const input = "foo";
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "foo");
  });

  it("should return stringified number for number", () => {
    const input = 1.5;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "1.5");
  });

  it("should return string for undefined", () => {
    const input = undefined;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "undefined");
  });

  it("should return string for BigInt", () => {
    const input = BigInt(1);
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "1");
  });

  it("should return string for boolean", () => {
    const input = true;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "true");
  });

  it("should return string for boolean", () => {
    const input = false;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "false");
  });

  it("should throw for Symbol", () => {
    const input = Symbol("foo");

    assert.throws(
      () => parsers.prepareValue(input),
      (e) => {
        assert.strictEqual(e instanceof globalThis.TypeError, true);
        assert.strictEqual(e.message, "Can not convert symbol to string.");
        return true;
      }
    );
  });

  it("should throw with window global for Symbol", () => {
    const input = Symbol("foo");
    const window = {
      TypeError: globalThis.TypeError
    };

    assert.throws(
      () => parsers.prepareValue(input, window),
      (e) => {
        assert.strictEqual(e instanceof window.TypeError, true);
        assert.strictEqual(e.message, "Can not convert symbol to string.");
        return true;
      }
    );
  });

  it("should throw for object.toString() not converting to string", () => {
    const input = {
      toString: () => [1]
    };

    assert.throws(
      () => parsers.prepareValue(input),
      (e) => {
        assert.strictEqual(e instanceof globalThis.TypeError, true);
        assert.strictEqual(e.message, "Can not convert object to string.");
        return true;
      }
    );
  });

  it("should throw for object.toString() not converting to string", () => {
    const input = {
      toString: () => [1]
    };
    const window = {
      TypeError: globalThis.TypeError
    };

    assert.throws(
      () => parsers.prepareValue(input, window),
      (e) => {
        assert.strictEqual(e instanceof window.TypeError, true);
        assert.strictEqual(e.message, "Can not convert object to string.");
        return true;
      }
    );
  });
});

describe("isGlobalKeyword", () => {
  it("should return false", () => {
    const input = "";
    const output = parsers.isGlobalKeyword(input);

    assert.strictEqual(output, false);
  });

  it("should return false", () => {
    const input = "foo";
    const output = parsers.isGlobalKeyword(input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "initial";
    const output = parsers.isGlobalKeyword(input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "INITIAL";
    const output = parsers.isGlobalKeyword(input);

    assert.strictEqual(output, true);
  });
});

describe("hasVarFunc", () => {
  it("should return false", () => {
    const input = "";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, false);
  });

  it("should return false", () => {
    const input = "--foo";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "var(--foo)";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "bar var(--foo)";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, true);
  });
});

describe("hasCalcFunc", () => {
  it("should return false", () => {
    const input = "";
    const output = parsers.hasCalcFunc(input);

    assert.strictEqual(output, false);
  });

  it("should return false", () => {
    const input = "1px";
    const output = parsers.hasCalcFunc(input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "calc(1px * 2)";
    const output = parsers.hasCalcFunc(input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "rgb(calc(255 / 3) 0 0)";
    const output = parsers.hasCalcFunc(input);

    assert.strictEqual(output, true);
  });
});

describe("parseCalc", () => {
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseCalc(input);

    assert.strictEqual(output, "");
  });

  it('should return "calc(6)"', () => {
    const input = "calc(2 * 3)";
    const output = parsers.parseCalc(input, {
      format: "specifiedValue"
    });

    assert.strictEqual(output, "calc(6)");
  });

  it('should return "calc(6px)"', () => {
    const input = "calc(2px * 3)";
    const output = parsers.parseCalc(input, {
      format: "specifiedValue"
    });

    assert.strictEqual(output, "calc(6px)");
  });

  it('should return "rgb(calc(255/3) 0 0)"', () => {
    const input = "rgb(calc(255 / 3) 0 0)";
    const output = parsers.parseCalc(input);

    assert.strictEqual(output, "rgb(calc(255/3) 0 0)");
  });

  it('should return "calc(100% - 2em)"', () => {
    const input = "calc(100% - 2em)";
    const output = parsers.parseCalc(input);

    assert.strictEqual(output, "calc(100% - 2em)");
  });

  it("should return calculated value", () => {
    const input = "calc(2em / 3)";
    const output = parsers.parseCalc(input);

    assert.strictEqual(output, "calc(0.666667em)");
  });

  it("should return serialized value", () => {
    const input = "calc(10px + 20%)";
    const output = parsers.parseCalc(input);

    assert.strictEqual(output, "calc(20% + 10px)");
  });

  it("should return serialized value", () => {
    const input = "calc(100vh + 10px)";
    const output = parsers.parseCalc(input);

    assert.strictEqual(output, "calc(10px + 100vh)");
  });
});

describe("parseNumber", () => {
  it("should return undefind", () => {
    const input = "";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefind", () => {
    const input = [];
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Percent",
        value: "100"
      }
    ];
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it('should return "1"', () => {
    const input = [
      {
        type: "Number",
        value: "1"
      }
    ];
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "1");
  });

  it('should return "0.5"', () => {
    const input = [
      {
        type: "Number",
        value: "0.5"
      }
    ];
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "0.5");
  });

  it('should return "0.5"', () => {
    const input = [
      {
        type: "Number",
        value: ".5"
      }
    ];
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "0.5");
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "-50"
      }
    ];
    const output = parsers.parseNumber(input, {
      min: 0,
      max: 100
    });

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "150"
      }
    ];
    const output = parsers.parseNumber(input, {
      min: 0,
      max: 100
    });

    assert.strictEqual(output, undefined);
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Number",
        value: "-50"
      }
    ];
    const output = parsers.parseNumber(input, {
      min: 0,
      max: 100,
      clamp: true
    });

    assert.strictEqual(output, "0");
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Number",
        value: "150"
      }
    ];
    const output = parsers.parseNumber(input, {
      min: 0,
      max: 100,
      clamp: true
    });

    assert.strictEqual(output, "100");
  });
});

describe("parseLength", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parseLength(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Percentage",
        value: "100"
      }
    ];
    const output = parsers.parseLength(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "100"
      }
    ];
    const output = parsers.parseLength(input);

    assert.strictEqual(output, undefined);
  });

  it("should return value", () => {
    const input = [
      {
        type: "Number",
        value: "0"
      }
    ];
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "0px");
  });

  it("should return value", () => {
    const input = [
      {
        type: "Dimension",
        unit: "px",
        value: "10"
      }
    ];
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "10px");
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Dimension",
        unit: "px",
        value: "-50"
      }
    ];
    const output = parsers.parseLength(input, {
      min: 0,
      max: 100
    });

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Dimension",
        unit: "px",
        value: "150"
      }
    ];
    const output = parsers.parseLength(input, {
      min: 0,
      max: 100
    });

    assert.strictEqual(output, undefined);
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Dimension",
        unit: "px",
        value: "-50"
      }
    ];
    const output = parsers.parseLength(input, {
      min: 0,
      max: 100,
      clamp: true
    });

    assert.strictEqual(output, "0px");
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Dimension",
        unit: "px",
        value: "150"
      }
    ];
    const output = parsers.parseLength(input, {
      min: 0,
      max: 100,
      clamp: true
    });

    assert.strictEqual(output, "100px");
  });
});

describe("parsePercent", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Dimension",
        unit: "px",
        value: "100"
      }
    ];
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "100"
      }
    ];
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, undefined);
  });

  it("should return value", () => {
    const input = [
      {
        type: "Percentage",
        value: "10"
      }
    ];
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "10%");
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Percentage",
        value: "-50"
      }
    ];
    const output = parsers.parsePercent(input, {
      min: 0,
      max: 100
    });

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Percentage",
        value: "150"
      }
    ];
    const output = parsers.parsePercent(input, {
      min: 0,
      max: 100
    });

    assert.strictEqual(output, undefined);
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Percentage",
        value: "-50"
      }
    ];
    const output = parsers.parsePercent(input, {
      min: 0,
      max: 100,
      clamp: true
    });

    assert.strictEqual(output, "0%");
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Percentage",
        value: "150"
      }
    ];
    const output = parsers.parsePercent(input, {
      min: 0,
      max: 100,
      clamp: true
    });

    assert.strictEqual(output, "100%");
  });
});

describe("parseMeasurement", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "100"
      }
    ];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "100"
      }
    ];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Dimension",
        unit: "deg",
        value: "180"
      }
    ];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, undefined);
  });

  it("should return value with em unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "em",
        value: "1"
      }
    ];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "1em");
  });

  it("should return value with percent", () => {
    const input = [
      {
        type: "Percentage",
        value: "100"
      }
    ];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "100%");
  });

  it("should return 0px for 0", () => {
    const input = [
      {
        type: "Number",
        value: "0"
      }
    ];
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "0px");
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Dimension",
        unit: "em",
        value: "-1"
      }
    ];
    const output = parsers.parseMeasurement(input, {
      min: 0,
      max: 1
    });

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Dimension",
        unit: "em",
        value: "1.1"
      }
    ];
    const output = parsers.parseMeasurement(input, {
      min: 0,
      max: 1
    });

    assert.strictEqual(output, undefined);
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Dimension",
        unit: "em",
        value: "-1"
      }
    ];
    const output = parsers.parseMeasurement(input, {
      min: 0,
      max: 1,
      clamp: true
    });

    assert.strictEqual(output, "0em");
  });

  it("should return clamped value", () => {
    const input = [
      {
        type: "Dimension",
        unit: "em",
        value: "1.1"
      }
    ];
    const output = parsers.parseMeasurement(input, {
      min: 0,
      max: 1,
      clamp: true
    });

    assert.strictEqual(output, "1em");
  });
});

describe("parseAngle", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Perecentage",
        value: "90"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Number",
        value: "90"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, undefined);
  });

  it('should return 0deg for "0"', () => {
    const input = [
      {
        type: "Number",
        value: "0"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "0deg");
  });

  it("should return value with deg unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "deg",
        value: "90"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "90deg");
  });

  it("should return value with deg unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "deg",
        value: "450"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "450deg");
  });

  it("should return value with deg unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "deg",
        value: "-90"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "-90deg");
  });

  it("should return value with grad unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "grad",
        value: "100"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "100grad");
  });

  it("should return value with grad unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "grad",
        value: "500"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "500grad");
  });

  it("should return value with deg unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "grad",
        value: "-100"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "-100grad");
  });

  it("should return value with rad unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "rad",
        value: "1.57"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "1.57rad");
  });

  it("should return value with rad unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "rad",
        value: "-1.57"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "-1.57rad");
  });

  it("should return value with turn unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "turn",
        value: "0.25"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "0.25turn");
  });

  it("should return value with turn unit", () => {
    const input = [
      {
        type: "Dimension",
        unit: "turn",
        value: "-0.25"
      }
    ];
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "-0.25turn");
  });
});

describe("parseUrl", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "String",
        value: "foo"
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted empty url string", () => {
    const input = [
      {
        type: "Url",
        value: ""
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("")');
  });

  it("should return quoted url string", () => {
    const input = [
      {
        type: "Url",
        value: "sample.png"
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it("should return quoted url string with escape", () => {
    const input = [
      {
        type: "Url",
        value: "sample\\\\-escaped.png"
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\\-escaped.png")');
  });

  it("should return quoted url string without escape", () => {
    const input = [
      {
        type: "Url",
        value: "sample escaped -space.png"
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample escaped -space.png")');
  });

  it("should return quoted url string without escape", () => {
    const input = [
      {
        type: "Url",
        value: "sample\tescaped\t-tab.png"
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\tescaped\t-tab.png")');
  });

  it("should return quoted url string without escape", () => {
    const input = [
      {
        type: "Url",
        value: "sample'escaped'-quote.png"
      }
    ];
    const output = parsers.parseUrl(input);

    // prettier-ignore
    assert.strictEqual(output, "url(\"sample'escaped'-quote.png\")");
  });

  it("should return quoted url string with escape", () => {
    const input = [
      {
        type: "Url",
        value: 'sample"escaped"-double-quote.png'
      }
    ];
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\\"escaped\\"-double-quote.png")');
  });
});

describe("parseString", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseString(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parseString(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Url",
        value: "exmaple.com"
      }
    ];
    const output = parsers.parseString(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted string", () => {
    const input = [
      {
        type: "String",
        value: "foo bar"
      }
    ];
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo bar"');
  });

  it("should return quoted string", () => {
    const input = [
      {
        type: "String",
        value: "'foo bar\""
      }
    ];
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"\'foo bar\\""');
  });

  it("should return quoted string", () => {
    const input = [
      {
        type: "String",
        value: "foo  bar"
      }
    ];
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo  bar"');
  });

  it("should return quoted string", () => {
    const input = [
      {
        type: "String",
        value: "foo \\ bar"
      }
    ];
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo \\ bar"');
  });

  it("should return quoted string", () => {
    const input = [
      {
        type: "String",
        value: 'foo "bar"'
      }
    ];
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo \\"bar\\""');
  });
});

describe("parseColor", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, undefined);
  });

  it("should return system color", () => {
    const input = [
      {
        type: "Identifier",
        name: "canvastext"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "canvastext");
  });

  it("should convert hsl to rgb values", () => {
    const input = [
      {
        type: "Function",
        name: "hsla",
        value: "0, 1%, 2%"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(5, 5, 5)");
  });

  it("should convert hsla to rgba values", () => {
    const input = [
      {
        type: "Function",
        name: "hsla",
        value: "0, 1%, 2%, 0.5"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgba(5, 5, 5, 0.5)");
  });

  it("should convert not zero hsl with non zero hue 120 to rgb(0, 255, 0)", () => {
    const input = [
      {
        type: "Function",
        name: "hsl",
        value: "120, 100%, 50%"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(0, 255, 0)");
  });

  it("should convert not zero hsl with non zero hue 240 to rgb(0, 0, 255)", () => {
    const input = [
      {
        type: "Function",
        name: "hsl",
        value: "240, 100%, 50%"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(0, 0, 255)");
  });

  it("should convert modern rgb to rgb values", () => {
    const input = [
      {
        type: "Function",
        name: "rgb",
        value: "128 0 128 / 1"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(128, 0, 128)");
  });

  it("should convert modern rgb with none values to rgb values", () => {
    const input = [
      {
        type: "Function",
        name: "rgb",
        value: "128 0 none"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(128, 0, 0)");
  });

  it("should convert modern rgba to rgba values", () => {
    const input = [
      {
        type: "Function",
        name: "rgba",
        value: "127.5 0 127.5 / .5"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgba(128, 0, 128, 0.5)");
  });

  it("should normalize lab values", () => {
    const input = [
      {
        type: "Function",
        name: "lab",
        value: "46.2775% -47.5621 48.5837 / 1.0"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "lab(46.2775 -47.5621 48.5837)");
  });

  it("should normalize color function values", () => {
    const input = [
      {
        type: "Function",
        name: "color",
        value: "srgb 0 .5 0 / 1.0"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "color(srgb 0 0.5 0)");
  });

  it("should normalize color-mix values", () => {
    const input = [
      {
        type: "Function",
        name: "color-mix",
        value: "in srgb, rgb(255 0 0), #0000ff 40%"
      }
    ];
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "color-mix(in srgb, rgb(255, 0, 0) 60%, rgb(0, 0, 255))");
  });
});

describe("parseImage", () => {
  it("should return undefined", () => {
    const input = "";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [];
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = [
      {
        type: "Identifier",
        name: "none"
      }
    ];
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined for negative radii", () => {
    const input = [
      {
        type: "Function",
        name: "radial-gradient",
        value: "circle -10px at center, red, blue"
      }
    ];
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return value", () => {
    const input = [
      {
        type: "Function",
        name: "linear-gradient",
        value: "green, blue"
      }
    ];
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "linear-gradient(green, blue)");
  });
});

describe("parseShorthand", () => {
  const flexGrow = require("../lib/properties/flexGrow");
  const flexShrink = require("../lib/properties/flexShrink");
  const flexBasis = require("../lib/properties/flexBasis");
  const shorthandForFlex = new Map([
    ["flex-grow", flexGrow],
    ["flex-shrink", flexShrink],
    ["flex-basis", flexBasis]
  ]);

  it("should return undefined for keyword", () => {
    const input = "none";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.strictEqual(output, undefined);
  });

  it("should return object", () => {
    const input = "0 0 auto";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "0",
      "flex-shrink": "0",
      "flex-basis": "auto"
    });
  });

  it("should return object", () => {
    const input = "0 1 auto";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "0",
      "flex-shrink": "1",
      "flex-basis": "auto"
    });
  });

  it("should return object", () => {
    const input = "2";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "2"
    });
  });

  it("should return object", () => {
    const input = "2 1";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "2",
      "flex-shrink": "1"
    });
  });

  it("should return object", () => {
    const input = "10px";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-basis": "10px"
    });
  });

  it("should return object", () => {
    const input = "2 10px";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "2",
      "flex-basis": "10px"
    });
  });

  it("should return undefined", () => {
    const input = "2 10px 20px";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, undefined);
  });

  it("should return object", () => {
    const input = "calc(2/3)";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "calc(0.666667)"
    });
  });

  it("should return object", () => {
    const input = "calc(2/3) calc(3*.5)";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "calc(0.666667)",
      "flex-shrink": "calc(1.5)"
    });
  });

  it("should return object", () => {
    const input = "1 0 var(--foo)";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "",
      "flex-shrink": "",
      "flex-basis": ""
    });
  });
});

describe("parseCSS", () => {
  it("should get ast", () => {
    const input = "color: green !important;";
    const opt = {
      context: "declarationList",
      parseValue: false
    };
    const output = parsers.parseCSS(input, opt);
    assert.strictEqual(output.type, "DeclarationList");
    assert.strictEqual(Object.hasOwn(output, "children"), true);
  });

  it("should get ast", () => {
    const input = "green";
    const opt = {
      context: "value",
      parseValue: false
    };
    const output = parsers.parseCSS(input, opt);
    assert.strictEqual(output.type, "Value");
    assert.strictEqual(Object.hasOwn(output, "children"), true);
  });

  it("should get object", () => {
    const input = "color: green !important;";
    const opt = {
      context: "declarationList",
      parseValue: false
    };
    const output = parsers.parseCSS(input, opt, true);
    const [
      {
        important,
        property,
        value: { value }
      }
    ] = output.children;
    assert.strictEqual(important, true);
    assert.strictEqual(property, "color");
    assert.strictEqual(value, "green");
  });
});

describe("parsePropertyValue", () => {
  it("should get undefined", () => {
    const property = "color";
    const value = "foo";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, undefined);
  });

  it("should get undefined", () => {
    const property = "color";
    const value = "calc(foo)";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, undefined);
  });

  it("should get empty string", () => {
    const property = "color";
    const value = "";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "");
  });

  it("should get string", () => {
    const property = "color";
    const value = "var(--foo)";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "var(--foo)");
  });

  it("should get string", () => {
    const property = "background-size";
    const value = "calc(3 / 2)";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "calc(1.5)");
  });

  it("should get string", () => {
    const property = "background-size";
    const value = "calc(3em / 2)";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "calc(1.5em)");
  });

  it("should get string", () => {
    const property = "background-size";
    const value = "calc(10px + 20%)";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "calc(20% + 10px)");
  });

  it("should get string", () => {
    const property = "color";
    const value = "initial";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "initial");
  });

  it("should get string", () => {
    const property = "color";
    const value = "CanvasText";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "canvastext");
  });

  it("should get string", () => {
    const property = "color";
    const value = "Green";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "Green");
  });

  it("should get array", () => {
    const property = "color";
    const value = "Green";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Identifier",
        name: "green"
      }
    ]);
  });

  it("should get string", () => {
    const property = "color";
    const value = "Green";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true,
      caseSensitive: true
    });
    assert.deepEqual(output, [
      {
        type: "Identifier",
        name: "Green",
        loc: null
      }
    ]);
  });

  it("should get string", () => {
    const property = "color";
    const value = "color(srgb 0 calc(1 / 2) 0)";
    const output = parsers.parsePropertyValue(property, value);
    assert.strictEqual(output, "color(srgb 0 calc(1/2) 0)");
  });

  it("should get array", () => {
    const property = "color";
    const value = "color(srgb 0 calc(1 / 2) 0)";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Function",
        name: "color",
        value: "srgb 0 calc(1/2) 0",
        raw: "color(srgb 0 calc(1/2) 0)"
      }
    ]);
  });

  it("should get array", () => {
    const property = "color";
    const value = "rgb(0 128 0)";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Function",
        name: "rgb",
        value: "0 128 0",
        raw: "rgb(0 128 0)"
      }
    ]);
  });

  it("should get array", () => {
    const property = "background-image";
    const value = "none";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Identifier",
        name: "none"
      }
    ]);
  });

  it("should get array", () => {
    const property = "background-image";
    const value = "url(example.png)";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Url",
        loc: null,
        value: "example.png"
      }
    ]);
  });

  it("should get array", () => {
    const property = "background-image";
    const value = "url(Example.png)";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Url",
        loc: null,
        value: "Example.png"
      }
    ]);
  });

  it("should get array", () => {
    const property = "background-image";
    const value = "linear-gradient(green, blue)";
    const output = parsers.parsePropertyValue(property, value, {
      inArray: true
    });
    assert.deepEqual(output, [
      {
        type: "Function",
        name: "linear-gradient",
        value: "green, blue",
        raw: "linear-gradient(green, blue)"
      }
    ]);
  });
});

describe("isValidPropertyValue", () => {
  it("should return false", () => {
    const input = "foo";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "red";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "initial";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "Canvas";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("-webkit-border-after-color", input);

    assert.strictEqual(output, true);
  });

  it("should return false", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("-moz-border-bottom-color", input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("background-color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "appworkspace";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "AppWorkSpace";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "light-dark(green, blue)";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "light";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "dark";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "normal";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "only dark";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return false for custom property", () => {
    const input = "red";
    const output = parsers.isValidPropertyValue("--foo", input);

    assert.strictEqual(output, false);
  });

  it("should return false for var()", () => {
    const input = "var(--foo)";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, false);
  });
});
