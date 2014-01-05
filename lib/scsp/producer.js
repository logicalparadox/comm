/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:spsc:producer');
var future = require('oath');
var inherits = require('super');

// internal constructors
var Queue = require('../queue').Queue;

/**
 * A `Producer` is the handle that writes messages to the
 * underlying data source. Designed to be extended.
 *
 * @param {Mixed} options
 * @api public
 */

var Producer = exports.Producer = function Producer(queue) {
  if (!(this instanceof Producer)) return new Producer(queue);
  this._producerState = { err: null, open: true, queue: queue || new Queue() };
}

/*!
 * Prototype
 */

Producer.prototype = {

  /*!
   * Constructor reference
   */

  constructor: Producer,

  get closed() {
    return !this._producerState.open;
  },

  /**
   * Write a message to the internal handle.
   *
   * @param {Mixed} message
   * @param {Function} cb(err)
   * @return {Oath} future
   * @api public
   */

  write: function(msg, cb) {
    var done = future(cb);
    var state = this._producerState;
    var ex;

    function error(err) {
      debug('(write) _write err: %s', err.message);
      state.err = err;
      done(err);
    }

    if (state.err) {
      ex = new Error('producer in error state');
      ex.error = state.err;
    } else if (!state.open) {
      ex = new Error('producer closed');
    }

    if (ex) {
      setImmediate(function() { error(err); });
      return done.thunk();
    }

    if (null == msg) state.open = false;

    debug('(write) waiting');
    state.queue.push([[ null, msg ], function(err) {
      if (err) return error(err);
      debug('(write) ok');
      done(null, true);
    }]);

    return done.thunk();
  }

}
