var debug = require('sherlock')('comm:arr');
var Future = require('oath');

var Arr = exports.Arr = function Arr() {
  this._arrState = { queue: [], waiting: [] };
}

Arr.prototype = {

  get length() {
    return this._arrState.queue.length;
  },

  push: function(obj, cb) {
    var future = Future(cb);
    var state = this._arrState;

    if (state.waiting.length) {
      debug('(push) waiting');
      var cb = state.waiting.shift();
      setImmediate(function() {
        debug('(next) resolved');
        cb(null, obj);
        future();
      });
    } else {
      debug('(push) queue');
      state.queue.push([ obj, future ]);
    }

    return future.thunk();
  },

  next: function(cb) {
    var future = Future(cb);
    var state = this._arrState;

    if (state.queue.length) {
      debug('(next) queue');
      var res = state.queue.shift();
      setImmediate(function() {
        debug('(push) resolved');
        future(null, res[0]);
        res[1]();
      });
    } else {
      debug('(next) waiting');
      state.waiting.push(future);
    }

    return future.thunk();
  }

}
