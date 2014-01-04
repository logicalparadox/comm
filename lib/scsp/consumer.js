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

var Consumer = exports.Consumer = function Consumer(opts) {
  if (!(this instanceof Consumer)) return new Consumer(opts);
  this._consumerState = { err: null, open: true };
  this.init(opts);
}

/**
 * Extend the Consumer constructor, creating a new constructor.
 */

Consumer.extend = inherits.extend;

/*!
 * Prototype
 */

Consumer.prototype = {

  /*!
   * Constructor reference
   */

  constructor: Consumer,

  /**
   * Invoke the intialize sequence.
   */

  init: function(opts) {
    this._init(opts);
  },

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
      debug('(shift) err: %s', err.message);
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

    this._read(function(err, msg) {
      if (err) return error(err);

      if (null == msg) {
        debug('(read) end');
        state.open = false;
      } else {
        debug('(read) msg');
      }

      done(null, msg);
    });

    return done.thunk();
  },

  /*!
   * Default `_init` allows for a local
   * consumer via an asynchronous queue.
   *
   * @param {Queue} queue
   * @api private
   */

  _init: function(queue) {
    var state = this._consumerState;
    state.queue = queue || new Queue();
  },

  /*!
   * Default `_read` shifts data from
   * the local asynchronous queue.
   *
   * @param {Function} cb(err, msg)
   * @api private
   */

  _read: function(cb) {
    var state = this._consumerState;
    state.queue.shift(cb);
  }

}
