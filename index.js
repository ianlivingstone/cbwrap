'use strict';

exports.wrap = function (fn) {
  return function () {
    var self = this;
    var args = Array.prototype.slice.call(arguments);

    return new Promise((resolve, reject) => {
      function processCb() {
        var args = Array.prototype.slice.call(arguments);
        if (args[0]) {
          return reject(args[0]);
        }

        if (args.length > 2) {
          return resolve.call(null, args.slice(1));
        }

        return resolve.apply(null, args.slice(1));
      }

      args.push(processCb);
      fn.apply(self, args);
    });
  };
};

exports.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var cb = args[args.length - 1];

    // This does not support functions that take a fn as terminal parameter
    // that is not a callback.
    if (!cb || typeof cb !== 'function') {
      return fn.apply(null, args);
    }

    args = args.slice(0, args.length - 1);
    return fn.apply(null, args).then(function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(null);

      cb.apply(null, args);
    }).catch(function(err) {
      cb.apply(null, [err]);
    });
  };
};
