/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:shared-chan');

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

var SharedChan = exports.SharedChan = function SharedChan(deliver) {
  if (!(this instanceof SharedChan)) return SharedChan.create();
  this._sharedChanState = { chans: [], deliver: deliver, open: true };
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
    var open = state.chans.filter(function(chan) { return !chan.closed; });
    if (null == msg && open.length) return cb();
    if (null == msg) state.open = false;
    debug('(pair) yield deliver');
    queue.push(msg, function(err) {
      if (err) return cb(err);
      debug('(pair) deliver complete');
      cb();
    });
  }

  return [ new Port(read), new SharedChan(deliver) ];
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

  clone: function() {
    var state = this._sharedChanState;

    if (!state.open) {
      debug('(clone) err: shared chan closed');
      throw new Error('shared chan closed');
    }

    var deliver = (function(self) {
      var state = self._sharedChanState;
      return function(msg, cb) {
        debug('(chan) shared: yield deliver');
        state.deliver.call(self, msg, function(err) {
          if (err) return cb(err);
          debug('(chan) shared: delivered');
          cb();
        });
      }
    })(this);

    var chan = new Chan(deliver);
    state.chans.push(chan);
    return chan;
  }

};
