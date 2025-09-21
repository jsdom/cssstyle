"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { CSSStyleDeclaration } = require("../lib/CSSStyleDeclaration");

describe("CSSStyleDeclaration", () => {
  it("does not enumerate internals", () => {
    const style = new CSSStyleDeclaration();
    for (const i in style) {
      assert.strictEqual(i.startsWith("_"), false);
    }
  });

  it("has methods", () => {
    const style = new CSSStyleDeclaration();
    assert.strictEqual(typeof style.item, "function");
    assert.strictEqual(typeof style.getPropertyValue, "function");
    assert.strictEqual(typeof style.setProperty, "function");
    assert.strictEqual(typeof style.getPropertyPriority, "function");
    assert.strictEqual(typeof style.removeProperty, "function");
  });

  it("has attributes", () => {
    const style = new CSSStyleDeclaration();
    assert.ok(style.__lookupGetter__("cssText"));
    assert.ok(style.__lookupSetter__("cssText"));
    assert.ok(style.__lookupGetter__("length"));
    assert.ok(style.__lookupSetter__("length"));
    assert.ok(style.__lookupGetter__("parentRule"));
  });

  it("sets internals for Element", () => {
    const window = {
      DOMException: globalThis.DOMException
    };
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
    const window = {
      DOMException: globalThis.DOMException
    };
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
    const style = new CSSStyleDeclaration(null, {
      foo: "bar"
    });
    assert.deepEqual(style._options, {
      foo: "bar",
      format: "specifiedValue"
    });
  });

  it("should not override format if exists", () => {
    const style = new CSSStyleDeclaration(null, {
      format: "computedValue"
    });
    assert.deepEqual(style._options, {
      format: "computedValue"
    });
  });

  it("getting cssText returns empty string if computedflag is set", () => {
    const window = {
      getComputedStyle: () => {},
      DOMException: globalThis.DOMException
    };
    const style = new CSSStyleDeclaration(window, {
      format: "computedValue"
    });
    style.cssText = "color: red;";
    assert.strictEqual(style.cssText, "");
  });

  it("setting improper css to cssText should not throw", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "color: ";
    assert.strictEqual(style.cssText, "");
    style.cssText = "color: red!";
    assert.strictEqual(style.cssText, "");
  });

  it("item() throws if argument is not given", () => {
    const style = new CSSStyleDeclaration();
    assert.throws(
      () => {
        style.item();
      },
      (e) => {
        assert.strictEqual(e instanceof globalThis.TypeError, true);
        assert.strictEqual(e.message, "1 argument required, but only 0 present.");
        return true;
      }
    );
  });

  it("camelcase properties are not assigned with setproperty()", () => {
    const style = new CSSStyleDeclaration();
    style.setProperty("fontSize", "12px");
    assert.strictEqual(style.cssText, "");
  });

  it("custom properties are case-sensitive", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "--fOo: purple";

    assert.strictEqual(style.getPropertyValue("--foo"), "");
    assert.strictEqual(style.getPropertyValue("--fOo"), "purple");
  });

  it("getPropertyValue for custom properties in cssText", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "--foo: red";

    assert.strictEqual(style.getPropertyValue("--foo"), "red");
  });

  it("getPropertyValue for custom properties with setProperty", () => {
    const style = new CSSStyleDeclaration();
    style.setProperty("--bar", "blue");

    assert.strictEqual(style.getPropertyValue("--bar"), "blue");
  });

  it("getPropertyValue for custom properties with object setter", () => {
    const style = new CSSStyleDeclaration();
    style["--baz"] = "yellow";

    assert.strictEqual(style.getPropertyValue("--baz"), "");
  });

  it("getPropertyPriority for property", () => {
    const style = new CSSStyleDeclaration();
    style.setProperty("color", "green", "important");
    assert.strictEqual(style.getPropertyPriority("color"), "important");
  });

  it("getPropertyPriority for custom property", () => {
    const style = new CSSStyleDeclaration();
    style.setProperty("--foo", "green", "important");
    assert.strictEqual(style.getPropertyPriority("--foo"), "important");
  });

  it("removeProperty throws if readonly flag is set", () => {
    const window = {
      getComputedStyle: () => {},
      DOMException: globalThis.DOMException
    };
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
