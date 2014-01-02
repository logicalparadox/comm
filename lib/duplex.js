/*!
 * Module dependencies
 */

// external utilites
var assert = require('assert');
var debug = require('sherlock')('comm:duplex');

// internal constructors
var Chan = require('./chan').Chan;
var Port = require('./port').Port;

/**
 * Duplexs handle bi-directional communication between
 * a pair of of `[ port, chan ]` pairs.
 *
 * @param {Port} port
 * @param {Chan} chan
 */

var Duplex = exports.Duplex = function Duplex(port, chan) {
  if (!(this instanceof Duplex)) return Duplex.create();
  this.__refs = Array.isArray(port) ? port : [ port, chan ];
  assert(this.__refs[0] instanceof Port, 'port not instanceof Port');
  assert(this.__refs[1] instanceof Chan, 'chan not instanceof Chan');
}

/**
 * Create a pair of `Duplex`s that can
 * communicate with eachother. Given return `[ a, b ]`,
 * messages sent to `a` will be recieved on `b` and visa-versa.
 *
 * @return {Array} pair of `Duplex`s
 * @api public
 */

Duplex.create = function() {
  var a = Chan();
  var b = Chan();
  var dsa = new Duplex(a[0], b[1]);
  var dsb = new Duplex(b[0], a[1]);
  return [ dsa, dsb ];
}

/*!
 * Prototype
 */

Duplex.prototype = {

  /**
   * Returns true if the chan and port
   * associated with this instance are closed.
   *
   * @return {Boolean} is closed
   * @api public
   */

  get closed() {
    return this.__refs[0].closed && this.__refs[1].closed;
  },

  /**
   * @see Chan#send
   * @api public
   */

  send: function(msg, cb) {
    return this.__refs[1].send(msg, cb);
  },

  /**
   * @see Port#recv
   * @api public
   */

  recv: function(cb) {
    return this.__refs[0].recv(cb);
  },

}
