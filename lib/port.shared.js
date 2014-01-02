/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:shared-port');
var Future = require('oath');

// internal constructors
var Chan = require('./chan').Chan;
var Deque = require('./deque').Deque;
var Port = require('./port').Port;

/**
 * A `SharedPort` is not a port (it cannot `.recv()`) but a factory
 * for `Port` instances. All instances created via `.clone()` will
 * use the same `read` function.
 *
 * @param {Function} register(key, cb)
 * @param {Function} read(key, cb)
 * @api public
 */

var SharedPort = exports.SharedPort = function SharedPort(register, read) {
  if (!(this instanceof SharedPort)) return SharedPort.create();
  this._sharedPortState = { ports: {}, read: read, register: register, open: true }
};

/**
 * Create a `[ sharedPort, chan ]` pair for message passing.
 * All clones of `sharedPort` will recieve each message from `chan`.
 * Each clone can recieve each message in different ticks, including
 * the `null` terminator, but the callback for `chan.send()` will
 * be invoked only when all ports have recieved a given message.
 *
 * @return {Array} refs
 * @api public
 */

SharedPort.create = function() {
  var deques = {};

  // async port register (called on clone)
  var register = (function(deques) {
    return function register(key, cb) {
      deques[key] = new Deque();
      setImmediate(cb);
    }
  })(deques);

  // async read for shared port (uses key)
  var read = (function(deques) {
    return function read(key, cb) {
      debug('(pair) read #%d', key);
      var deque = deques[key];
      deque.shift(function(err, msg) {
        if (err) return cb(err);
        debug('(pair) read complete: #%d', key);
        cb(null, msg);
      });
    }
  })(deques);

  // need sharedPort state to close on null delivery
  var sharedPort = new SharedPort(register, read);

  // async delivery ... cb when delivered to all ports
  var deliver = (function(deques, sharedPort) {
    function after(n, cb) {
      var err = null;
      return function(ex) {
        if (err) return;
        if (ex) err = ex;
        if (err) return cb(err);
        --n || cb();
      }
    }

    return function deliver(msg, cb) {
      var keys = Object.keys(deques);
      var state = sharedPort._sharedPortState;
      if (null == msg) state.open = false;

      var next = after(keys.length, function(err) {
        if (err) return cb(err);
        debug('(pair) deliver complete: %d', keys.length);
        cb();
      });

      debug('(pair) yield deliver: %d', keys.length);
      for (var key in keys) deques[key].push(msg, next);
    }
  })(deques, sharedPort);

  return [ sharedPort, new Chan(deliver) ];
};

/*!
 * Prototype
 */

SharedPort.prototype = {

  /**
   * Return boolean indicating if underlying
   * source has closed, thus no more clones can
   * be created.
   *
   * @return {Boolean} is source closed
   * @api public
   */

  get closed() {
    return !this._sharedPortState.open;
  },

  /**
   * Create a new `Port` that will read messages
   * from the shared read function.
   *
   * @return {Port} port
   * @throws {Error} if this `SharedPort` is closed
   * @api public
   */

  clone: function() {
    var future = Future();
    var state = this._sharedPortState;

    if (!state.open) {
      debug('(clone) err: shared port closed');
      throw new Error('shared port closed');
    }

    var keys = Object.keys(state.ports).sort();
    var id = parseFloat(keys[keys.length - 1]) + 1 || 0;

    var read = (function(self, key) {
      var state = self._sharedPortState;
      return function(cb) {
        var port = this;
        debug('(port) shared: yield read');
        state.read.call(self, key, function(err, msg) {
          if (err) return cb(err);
          debug('(port) shared: read complete');
          cb(null, msg);
        });
      }
    })(this, id);

    var port = new Port(read);
    state.ports[id] = port;

    state.register.call(this, id, function(err) {
      if (err) {
        debug('(clone) err: %s', err.message);
        state.ports[id] = null;
        return future(err);
      }

      debug('(clone) success: #%d', id);
      future(null, port);
    });

    return future.thunk();
  }

}
