# `cssstyle` is no longer maintained as a standalone package

This package provided an implementation of the CSS Object Model's `CSSStyleDeclaration` interface for Node.js.

Its implementation [has been merged into `jsdom`](https://github.com/jsdom/jsdom/commit/4aaacc67ccba17093578b3538402ec43dc0f94aa), where development continues. The standalone `cssstyle` package is no longer supported or maintained. For maintained CSS style functionality, use [`jsdom`](https://github.com/jsdom/jsdom) through APIs such as `element.style` and `window.getComputedStyle()`.

Existing releases remain available [on npm](https://www.npmjs.com/package/cssstyle) and have not been deprecated there, to avoid installation warnings for applications that continue to use this package.

To browse the source code from before this repository was archived, see [Git history](https://github.com/jsdom/cssstyle/tree/4c03cba8c0e132c3fb0802c0a4d3ab0acfbc7d33).
