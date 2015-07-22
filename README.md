# dom-patch

[![Build Status](https://travis-ci.org/canjs/dom-patch.svg?branch=master)](https://travis-ci.org/canjs/dom-patch)
[![npm version](https://badge.fury.io/js/dom-patch.svg)](http://badge.fury.io/js/dom-patch)

A library for patching DOMs. Binding to a document will return patches as they happen, which can be re-applied to another document.

This is useful when syncing DOMs, such as with web worker rendering.

## Usage

```js
var patch = require("dom-patch");
var apply = require("dom-patch/apply");

patch(document, function(patches){

	apply(otherDocument, patches);

});
```

## License

MIT
