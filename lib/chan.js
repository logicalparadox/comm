/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:chan');
var Future = require('oath');

// internal utilties
var scsp = require('./scsp');

// internal constructors
var Port = require('./port').Port;

/**
 * Channels handle the sending of messages via the
 * provided deliver function.
 *
 * @param {Function} deliver invoked for each message sent
 * @api public
 */

var Chan = exports.Chan = function Chan(producer) {
  if (!(this instanceof Chan)) return Chan.create();
  this._chanState = { producer: producer, open: true };
}

/**
 * Create a `[ port, chan ]` for message passing.
 *
 * @return {Array} refs
 * @api public
 */

Chan.create = function() {
  var pair = scsp.queue();
  return [ new Port(pair[0]), new Chan(pair[1]) ];
}

/*!
 * Prototype
 */

Chan.prototype = {

  constructor: Chan,

  /**
   * Return boolean indicating if channel is closed and will not accept
   * more `.send()`.
   *
   * @return {Boolean} is channel closed
   * @api public
   */

  get closed() {
    return !this._chanState.open;
  },

  /**
   * Queue a message for delivery. Callback invoked or Future resolved on
   * flush. Sending `null` will end the channel.
   *
   * @param {Mixed} msg to queue
   * @param {Function} cb to invoke on flush
   * @return {Oath} thunk to invoke on flush
   * @api public
   */

  send: function(msg, cb) {
    var done = Future(cb);
    var state = this._chanState;

    if (!state.open) {
      debug('(send) err: chan closed');
      done(new Error('chan closed'));
      return done.thunk();
    }

    if (null == msg) {
      debug('(send) end');
      state.open = false;
    }

    debug('(send) deliver wait');
    state.producer.write(msg, function(err) {
      if (err) return done(err);
      debug('(send) deliver done');
      done(null, true);
    });

    return done.thunk();
  }

}
