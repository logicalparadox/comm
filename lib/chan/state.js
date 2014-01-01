/*!
 * Module dependencies
 */

// external utilities
var debug = require('sherlock')('comm:chan:state');

/**
 * A channel's state stores the messages that need
 * to be sent, invoke the delivery function for each
 * method serially, and resolves queued `send` futures.
 *
 * @param {Function} deliver fn invoked for each message
 * @api public
 */

var ChanState = exports.ChanState = function(deliv) {
  this.deliver = deliv;
  this.messages = [];
  this.state = 'open';
};

/*!
 * Prototype
 */

ChanState.prototype = {

  /**
   * Push a message to the queue or resolve
   * a future with an error if the channel
   * has been closed.
   *
   * @param {Mixed} msg to queue
   * @param {Oath} future to resolve
   * @api public
   */

  push: function(msg, future) {
    var self = this;

    if ('open' === this.state) {
      this.messages.push([ msg, future ]);
      debug('(push) committed');

      if (msg === null) {
        debug('(push) ended');
        this.state = 'ended';
      }

      setImmediate(function() {
        self.process();
      });
    } else {
      setImmediate(function() {
        debug('(push) failed: ended');
        future(new Error('channel has ended'));
      });
    }
  },

  /**
   * Deliver the messages serially. Will resolve
   * the send receipt future upon flush.
   *
   * @api public
   */

  process: function() {
    if (!this.messages.length) return;

    var self = this;
    var entry = this.messages.shift();

    this.deliver(entry[0], function done(err) {
      if (err) return entry[1](err);
      entry[1]();

      setImmediate(function() {
        self.process();
      });
    });
  }

}
