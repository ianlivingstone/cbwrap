"use strict";
/*global describe:false it:false*/

var assert = require('assert');
var cbwrap = require('./index');

function testGenerator (argsPassedIn, cbArgsOut, context) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var cb = args[args.length - 1];
    args = args.slice(0,args.length - 1);
    
    assert.deepEqual(args, argsPassedIn);

    if (context) {
      assert.strictEqual(context, this);
    }

    cb.apply(null, cbArgsOut);
  };
}

describe('cbwrap', function() {
  describe('#wrap', function() {
    it('given a cb async function it returns a promise', function() {
      var fn = testGenerator([], []);   
      var wrappedFn = cbwrap.wrap(fn);

      return wrappedFn().then(() => {
        var args = Array.prototype.slice.call(arguments);
        assert.strictEqual(args.length, 0);
      });
    });

    it('it rejects promise if cb returns an error', function() {
      var fn = testGenerator([], [new Error('hi')]);
      var wrappedFn = cbwrap.wrap(fn);

      return wrappedFn().catch((err) => {
        assert.strictEqual(err.message, 'hi');
      });
    });

    it('passes args back as an array on resolve', function() {
      var fn = testGenerator([], [null, 'a', 'b']);
      var wrappedFn = cbwrap.wrap(fn);

      return wrappedFn().then((args) => {
        assert.deepEqual(args, ['a', 'b']);
      });
    });

    it('wrapper passes arguments to called fn', function () {
      var fn = testGenerator(['a','b','c'], []);
      var wrappedFn = cbwrap.wrap(fn);

      return wrappedFn('a', 'b', 'c');
    });

    it('maintains the context of the fn', function () {
      var a = {};
      a['fn'] = testGenerator(['a', 'b', 'c'], [], a).bind(a);
      
      var wrappedFn = cbwrap.wrap(a.fn);
      return wrappedFn('a', 'b', 'c');
    });
  });

  describe('#nodeify', function() {
    it('calls the cb with an error if promise is rejected', function(done) {
      var fn = cbwrap.nodeify(function () {
        return Promise.reject(new Error('hoho'));
      });

      fn(function(err) {
        assert.ok(err);
        assert.strictEqual(err.message, 'hoho');

        done();
      });
    });

    it('calls cb w/ null err and args if promise is fulfilled', function(done) {
      var fn = cbwrap.nodeify(function() {
        return Promise.resolve({ a: 1 });
      });

      fn(function(err, value) {
        assert.ifError(err);
        assert.strictEqual(value.a, 1);

        done();
      });
    });

    it('maintains support for promises', function() {
      var fn = cbwrap.nodeify(function() {
        return Promise.resolve({ a: 1 });
      });

      return fn();
    });
  });
});
