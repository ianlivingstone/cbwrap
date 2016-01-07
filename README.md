# Callback Wrap Utility

This is a very simple utility that provides functionality for moving between
promises and node style callbacks. This library only supports es6 native
Promises that are shipped with Node.

Does not bundle a shim for es6 promises, uses many es5 features.

## Installation

Simply acquire it from npm.

```js
npm install cbwrap
```

## cb#wrap

This function wraps any callback based api to ensure it returns a promise. All
context is maintained. If there is more than one argument, they are collapsed
into an array to maintan coherence with the Promises/A+ spec.

```js
var fs = require('fs');
var cbwrap = require('cbwrap');

var readFile = cbwrap.wrap(fs.readFile);

readFile('myfile').then((data) => {
  console.log(data);
}).catch((err) => {
  console.log('oh no an error!', err);
});
```

## cb#nodeify

This function wraps any promise producing function and provides a callback
interface as well. This makes it easy to support both Promises and Node style
api's.

**NOTE**: This does not support an API that accepts an optional progess hook
(function) and an optional callback. Pull requests welcome :)

```js
var cbwrap = require('cbwrap');

function myApi (a) {
  return Promise.resolve(b);
}

exports.myApi = cbwrap.nodeify(myApi);
```
