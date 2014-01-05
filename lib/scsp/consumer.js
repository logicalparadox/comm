/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:spsc:consumer');
var future = require('oath');
var inherits = require('super');

// internal dependencies
var Queue = require('../queue').Queue;

/**
 * A Consumer is the handle that reads messages from the
 * underlying data source. Designed to be extended.
 *
 * @param {Mixed} options
 * @api public
 */

var Consumer = exports.Consumer = function Consumer(queue) {
  if (!(this instanceof Consumer)) return new Consumer(queue);
  this._consumerState = { err: null, open: true, queue: queue || new Queue() };
}

/*!
 * Prototype
 */

Consumer.prototype = {

  /*!
   * Constructor reference
   */

  constructor: Consumer,

  /**
   * Read a message from the internal handle.
   *
   * @param {Function} cb(err, msg)
   * @return {Oath} future
   */

  read: function(cb) {
    var done = future(cb);
    var state = this._consumerState;
    var ex;

    function error(err) {
      debug('(read) err: %s', err.message);
      state.err = err;
      done(err);
    }

    if (state.err) {
      ex = new Error('consumer in error state');
      ex.error = state.err;
    } else if (!state.open) {
      ex = new Error('consumer closed');
    }

    if (ex) {
      setImmediate(function() { error(ex); });
      return done.thunk();
    }

    debug('(read) waiting');
    state.queue.shift(function(ex, raw) {
      var obj = raw[0];
      var err = ex || obj[0];
      var msg = obj[1];

      if (raw[1]) done.thunk(raw[1]);
      if (err) return error(err);
      if (null == msg) state.open = false;

      debug('(read) ok');
      done(null, msg);
    });

    return done.thunk();
  }

}
