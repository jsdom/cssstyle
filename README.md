CSSStyleDeclaration
===================

CSSStyleDeclaration is a work-a-like to the CSSStyleDeclaration class in Nikita Vasilyev's [[https://github.com/NV/CSSOM|CSSOM]]. I made it so that when using [[https://github.com/tmtk75/node-jquery|jQuery in node]] setting css attributes via $.fn.css() would work. node-jquery uses [[https://github.com/tmpvar/jsdom|jsdom]] to create a DOM to use in node. jsdom uses CSSOM for styling, and CSSOM's implementation of the [[http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration|CSSStyleDeclaration]] doesn't support [[http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSS2Properties|CSS2Properties]], which is how jQuery's [[http://api.jquery.com/css/|$.fn.css()]] operates.


Why? Not just issue a pull request?
----
Well, NV wants to keep CSSOM fast (which I can appreciate) and CSS2Properties aren't required by the standard (though every browser has the interface). So I figured the path of least resistence would be to just modify this one class, publish it as a node module (that requires CSSOM) and then make a pull request of jsdom to use it.
