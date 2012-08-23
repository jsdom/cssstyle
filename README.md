[![build status](https://secure.travis-ci.org/chad3814/CSSStyleDeclaration.png)](http://travis-ci.org/chad3814/CSSStyleDeclaration)
CSSStyleDeclaration
===================

CSSStyleDeclaration is a work-a-like to the CSSStyleDeclaration class in Nikita Vasilyev's [CSSOM](https://github.com/NV/CSSOM). I made it so that when using [jQuery in node](https://github.com/tmtk75/node-jquery) setting css attributes via $.fn.css() would work. node-jquery uses [jsdom](https://github.com/tmpvar/jsdom) to create a DOM to use in node. jsdom uses CSSOM for styling, and CSSOM's implementation of the [CSSStyleDeclaration](http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration) doesn't support [CSS2Properties](http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSS2Properties), which is how jQuery's [$.fn.css()](http://api.jquery.com/css/) operates.


Why not just issue a pull request?
----
Well, NV wants to keep CSSOM fast (which I can appreciate) and CSS2Properties aren't required by the standard (though every browser has the interface). So I figured the path of least resistence would be to just modify this one class, publish it as a node module (that requires CSSOM) and then make a pull request of jsdom to use it.
