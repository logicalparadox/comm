/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:shared-chan');
var Future = require('oath');

// internal constructors
var Chan = require('./chan').Chan;
var Queue = require('./queue').Queue;
var Port = require('./port').Port;

/**
 * A `SharedChan` is not a channel (it cannot `.send()`) but a factory
 * for `Chan` instances. All instances created via `.clone()` will
 * use the same `deliver` function.
 *
 * @param {Function} deliver function
 * @api public
 */

var SharedChan = exports.SharedChan = function SharedChan(register, deliver) {
  if (!(this instanceof SharedChan)) return SharedChan.create();
  this._sharedChanState = { chans: {}, deliver: deliver, register: register, open: true };
};

/**
 * Create a `[ port, sharedChan ]` pair for message passing.
 * All clones of `sharedChan` will deliver to provided `port`.
 * Each clone can be ended via `null` independently but the `port`
 * will not recieve `null` terminator until all clones are closed.
 *
 * @return {Array} refs
 * @api public
 */

SharedChan.create = function() {
  var queue = new Queue();

  // async register
  function register(key, cb) {
    setImmediate(cb);
  }

  // async read hook from queue
  function read(cb) {
    debug('(pair) yield read');
    queue.shift(function(err, msg) {
      if (err) return cb(err);
      debug('(pair) read complete');
      cb(null, msg);
    });
  }

  // async deliver hook to queue
  function deliver(msg, cb) {
    var state = this._sharedChanState;
    var open = Object.keys(state.chans)
      .map(function(key) { return state.chans[key]; })
      .filter(function(chan) { return !chan.closed; });
    if (null == msg && open.length) return cb();
    if (null == msg) state.open = false;
    debug('(pair) yield deliver');
    queue.push(msg, function(err) {
      if (err) return cb(err);
      debug('(pair) deliver complete');
      cb();
    });
  }

  return [ new Port(read), new SharedChan(register, deliver) ];
};

/*!
 * Prototype
 */

SharedChan.prototype = {

  /**
   * Return boolean indicating if all clones
   * have closed.
   *
   * @return {Boolean} is channel closed
   * @api public
   */

  get closed() {
    return !this._sharedChanState.open;
  },

  /**
   * Create a new `Chan` that will forward
   * messages to the the shared delivery function.
   *
   * @return {Chan} chan
   * @throws {Error} if this `SharedChan` is closed
   * @api public
   */

  clone: function(cb) {
    var done = Future(cb);
    var state = this._sharedChanState;

    if (!state.open) {
      debug('(clone) err: shared chan closed');
      done(new Error('shared chan closed'));
      return done.thunk();
    }

    var keys = Object.keys(state.chans).sort();
    var key = parseFloat(keys[keys.length - 1]) + 1 || 0;
    var chan = new Chan(deliver(this, key));

    debug('(clone) yeild register: #%d', key);
    state.register.call(this, key, function(err) {
      if (err) return done(err);
      debug('(clone) success: #%d', key);
      state.chans[key] = chan;
      done(null, chan);
    });

    return done.thunk();
  }

};

/*!
 * Shared deliver function for all chans
 * created via `.clone()`.
 *
 * @param {SharedChan} self context
 * @param {String} key
 * @return {Function} deliver(msg, cb)
 * @api private
 */

function deliver(self) {
  var state = self._sharedChanState;
  return function yieldDeliver(msg, cb) {
    debug('(chan) shared: yield deliver');
    state.deliver.call(self, msg, function(err) {
      if (err) return cb(err);
      debug('(chan) shared: delivered');
      cb();
    });
  }
}
