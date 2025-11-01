"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { CSSStyleDeclaration } = require("../lib/CSSStyleDeclaration");

describe("CSSStyleDeclaration", () => {
  const window = {
    getComputedStyle: () => {},
    DOMException: globalThis.DOMException,
    TypeError: globalThis.TypeError
  };

  it("has methods", () => {
    const style = new CSSStyleDeclaration(window);
    assert.strictEqual(typeof style.item, "function");
    assert.strictEqual(typeof style.getPropertyValue, "function");
    assert.strictEqual(typeof style.setProperty, "function");
    assert.strictEqual(typeof style.getPropertyPriority, "function");
    assert.strictEqual(typeof style.removeProperty, "function");
  });

  it("has attributes", () => {
    const style = new CSSStyleDeclaration(window);
    assert.ok(style.__lookupGetter__("cssText"));
    assert.ok(style.__lookupSetter__("cssText"));
    assert.ok(style.__lookupGetter__("length"));
    assert.ok(style.__lookupSetter__("length"));
    assert.ok(style.__lookupGetter__("parentRule"));
  });

  it("sets internals for Element", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    let callCount = 0;
    const callback = () => {
      callCount++;
    };
    const style = new CSSStyleDeclaration(window, {
      context: node,
      onChange: callback
    });
    style.cssText = "color: green;";
    assert.strictEqual(callCount, 1);
  });

  it("sets internals for CSSRule", () => {
    const rule = {
      parentRule: {},
      parentStyleSheet: {
        ownerDocument: {
          defaultView: {
            DOMException: window.DOMException
          }
        }
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: rule
    });
    assert.deepEqual(style.parentRule, rule);
  });

  it("has format in internal options", () => {
    const style = new CSSStyleDeclaration(window, {
      foo: "bar"
    });
    assert.deepEqual(style._options, {
      format: "specifiedValue"
    });
  });

  it("should not override format if exists", () => {
    const style = new CSSStyleDeclaration(window, {
      format: "computedValue"
    });
    assert.deepEqual(style._options, {
      format: "computedValue"
    });
  });

  it("getting cssText returns empty string if computed flag is set", () => {
    const style = new CSSStyleDeclaration(window, {
      format: "computedValue"
    });
    style.cssText = "color: red;";
    assert.strictEqual(style.cssText, "");
  });

  it("setting improper css to cssText should not throw", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "color: ";
    assert.strictEqual(style.cssText, "");
    style.cssText = "color: red!";
    assert.strictEqual(style.cssText, "");
  });

  it("item() throws if argument is not given", () => {
    const style = new CSSStyleDeclaration(window);
    assert.throws(
      () => {
        style.item();
      },
      (e) => {
        assert.strictEqual(e instanceof window.TypeError, true);
        assert.strictEqual(e.message, "1 argument required, but only 0 present.");
        return true;
      }
    );
  });

  it("camelcase properties are not assigned with setproperty()", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("fontSize", "12px");
    assert.strictEqual(style.cssText, "");
  });

  it("custom properties are case-sensitive", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "--fOo: purple";

    assert.strictEqual(style.getPropertyValue("--foo"), "");
    assert.strictEqual(style.getPropertyValue("--fOo"), "purple");
  });

  it("getPropertyValue for custom properties in cssText", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "--foo: red";

    assert.strictEqual(style.getPropertyValue("--foo"), "red");
  });

  it("getPropertyValue for custom properties with setProperty", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--bar", "blue");

    assert.strictEqual(style.getPropertyValue("--bar"), "blue");
  });

  it("getPropertyValue for custom properties with object setter", () => {
    const style = new CSSStyleDeclaration(window);
    style["--baz"] = "yellow";

    assert.strictEqual(style.getPropertyValue("--baz"), "");
  });

  it("getPropertyPriority for property", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("color", "green", "important");
    assert.strictEqual(style.getPropertyPriority("color"), "important");
  });

  it("getPropertyPriority for custom property", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--foo", "green", "important");
    assert.strictEqual(style.getPropertyPriority("--foo"), "important");
  });

  it("setProperty throws if read-only flag is set", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--foo", "green");
    style.setOptions({
      readOnly: true
    });
    assert.throws(
      () => {
        style.setProperty("--foo", "red");
      },
      (e) => {
        assert.strictEqual(e instanceof window.DOMException, true);
        assert.strictEqual(e.name, "NoModificationAllowedError");
        assert.strictEqual(e.message, "Property --foo can not be modified.");
        return true;
      }
    );
  });

  it("removeProperty throws if read-only flag is set", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--foo", "green");
    style.setProperty("--bar", "red");
    assert.strictEqual(style.removeProperty("--foo"), "green");
    style.setOptions({
      readOnly: true
    });
    assert.throws(
      () => {
        style.removeProperty("--bar");
      },
      (e) => {
        assert.strictEqual(e instanceof window.DOMException, true);
        assert.strictEqual(e.name, "NoModificationAllowedError");
        assert.strictEqual(e.message, "Property --bar can not be modified.");
        return true;
      }
    );
  });
});
