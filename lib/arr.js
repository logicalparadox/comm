var debug = require('sherlock')('comm:arr');
var Future = require('oath');

var Arr = exports.Arr = function Arr() {
  this.queue = [];
  this.waiting = [];
}

Arr.prototype = {

  get length() {
    return this.queue.length;
  },

  push: function(obj, cb) {
    var future = Future(cb);

    if (this.waiting.length) {
      var cb = this.waiting.shift();
      setImmediate(function() {
        cb(null, obj);
        future();
      });
    } else {
      this.queue.push([ obj, future ]);
    }

    return future.thunk();
  },

  next: function(cb) {
    var future = Future(cb);

    if (this.queue.length) {
      var res = this.queue.shift();
      setImmediate(function() {
        future(null, res[0]);
        res[1]();
      });
    } else {
      this.waiting.push(future);
    }

    return future.thunk();
  }

}
