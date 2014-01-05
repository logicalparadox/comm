/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('queue:distributed');
var Future = require('oath');

// internal constructors
var Queue = require('./queue').Queue;

/**
 * A `Distributor` is a write-only queue that forwards
 * any writes to one, many or all or its child queues using
 * the provided strategy.
 *
 * @param {Function} strategy(obj, method, queues, cb)
 * @api public
 */

var Distributor = exports.Distributor = function Distributor(strategy) {
  this._distQueueState = { drain: [], queues: {}, strategy: strategy };
}

/*!
 * Strategies
 */

Distributor.strategy = {

  /**
   * Distribute strategy that fowards objects to
   * all child queues. Callback invoke when all
   * children have recieved.
   *
   * @api public
   */

  all: function() {
    return function(obj, method, queues, cb) {
      var keys = Object.keys(queues);
      var next = after(keys.length, cb);
      for (var key in keys) queues[key][method](obj, next);
    }
  },

  /**
   * Distrubte strategy that forwards objects to
   * a single random child queue. Callback invoked
   * when child has recieved.
   *
   * @api public
   */

  random: function() {
    return function(obj, method, queues, cb) {
      var keys = Object.keys(queues)
      var rand = Math.floor(Math.random() * keys.length);
      var key = keys[rand];
      queues[key][method](obj, cb);
    }
  },

  /**
   * Distrubute strategy that forwards objects to
   * a single child, cycling through children sequentially.
   * Callback invoked when child has recieved.
   *
   * @api public
   */

  cycle: function() {
    var key = null;
    return function(obj, method, queues, cb) {
      var keys = Object.keys(queues);
      var index = key ? keys.indexOf(key) : -1;
      var next = index == (keys.length - 1) ? 0 : index;
      key = keys[next];
      queues[key][method](obj, cb);
    }
  }

}

/*!
 * Prototype
 */

Distributor.prototype = {

  /**
   * Get the current count of child queues.
   *
   * @return {Number} count of queues
   * @api public
   */

  get count() {
    var keys = Object.keys(this._distQueueState.queues);
    return keys.length;
  },

  /**
   * Get the current count of objects residing
   * is all child queues.
   *
   * @return {Number} total count of items
   * @api public
   */

  get length() {
    var len = 0;
    var queues = this._distQueueState.queues;
    for (var key in queues) len += queues[key].length;
    return len;
  },

  /**
   * Set or create a queue at a given key.
   *
   * @param {String} key
   * @param {Queue} queue
   * @return {Queue} created or provided
   * @api public
   */

  set: function(key, queue) {
    var self = this;
    var state = this._distQueueState;
    queue = queue || new Queue();

    var exists = Object.keys(state.queues)
      .map(function(key) { return state.queues[key]; })
      .indexOf(queue);

    if (~exists) return queue;
    queue.drain(drain(this, queue));
    state.queues[key] = queue;
    return queue;
  },

  /**
   * Get queue at a given key.
   *
   * @param {String} key
   * @return {Queue} queue at key
   * @api public
   */

  get: function(key) {
    return this._distQueueState.queues[key];
  },

  /**
   * Async `Arroy#push()` that will add item to
   * end of the queue(s) selected by the
   * distribution strategy.
   *
   * @param {Mixed} object
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  push: setter('push'),

  /**
   * Async `Arroy#unshift()` that will add item to
   * begining of the queue(s) selected by the
   * distribution strategy.
   *
   * @param {Mixed} object
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  unshift: setter('unshift'),

  /**
   * Async function that will be resolved on
   * the NEXT occurance of ALL child queues being
   * empty (will wait if all are currently empty).
   *
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  drain: function() {
    var future = Future(cb);
    var state = this._distQueueState;
    debug('(drain) waiting');
    state.drain.push(future);
    return future.thunk();
  }
}

/*!
 * Wrapper for async setter methods.
 *
 * @param {String} method to use on queue
 * @return {Function} setter(obj, cb)
 * @api private
 */

function setter(method) {
  return function(obj, cb) {
    var future = Future(cb);
    var state = this._distQueueState;
    state.strategy(obj, method, state.queues, future);
    return future.thunk();
  }
}

/*!
 * Drain listener used for each queue added
 * to a given collection. Will re-listen
 * after each occurance.
 *
 * @param {Distributor} self
 * @param {Queue} queue to listen on
 * @return {Function} listener
 * @api public.
 */

function drain(self, queue) {
  var state = self._distQueueState;
  return function yieldDrain() {
    if (!self.length && state.drain.length) {
      while (state.drain.length) {
        debug('(drain) resolve');
        state.drain.shift()(null, true);
      }
    }

    setImmediate(function() {
      queue.drain(yieldDrain);
    });
  }
}

/*!
 * Invoked callback after `n` invocations
 * of returned `next`. `next(err)` will immediately
 * invoke `cb` and further `next()` will be ignored.
 *
 * @param {Number} n
 * @param {Function} callback
 * @return {Function} next(err|null)
 * @api private
 */

function after(n, cb) {
  var err = null;
  return function(ex) {
    if (err) return;
    if (ex) err = ex;
    if (err) return cb(err);
    --n || cb();
  }
}
