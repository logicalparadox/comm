/*!
 * Module dependencies
 */

// internal constructors
var Queue = require('../deque').Queue;

// exported internal constructors
var Consumer = require('./consumer').Consumer;
var Producer = require('./producer').Producer;
var StreamConsumer = require('./consumer.stream').StreamConsumer;
var StreamProducer = require('./producer.stream').StreamProducer;

/*!
 * Module exports
 */

exports = module.exports = {
  Consumer: Consumer,
  Producer: Producer,
  StreamConsumer: StreamConsumer,
  StreamProducer: StreamProducer
};

/**
 * Create a `[ consumer, producer ]` pair. If no arguments are
 * provided the pair will locally connected. Can also provide
 * a single duplex/transform stream or a pair of `readable, writable`
 * streams.
 *
 * @param {Stream} readable capable stream
 * @param {Stream} writable capable stream
 * @return {Array} `[ consumer, producer ]`
 * @api public
 */

exports.scsp = function(readable, writable) {
  var consumer, producer;

  if (readable) {
    writable = writable || readable;
    consumer = new StreamConsumer(readable);
    producer = new StreamProducer(writable);
  } else {
    var queue = new Queue();
    consumer = new Consumer(queue);
    producer = new Producer(queue);
  }

  return [ consumer, producer ];
};
