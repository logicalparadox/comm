
// utilities (should be extracted)
exports.Queue = require('./lib/queue').Queue;
exports.DistributedQueue = require('./lib/queue.distributed').DistributedQueue;

// channels
exports.Chan = require('./lib/chan').Chan;

// ports
exports.Port = require('./lib/port').Port;

// sugar
exports.Duplex = require('./lib/duplex').Duplex;

// stuffs
exports.scsp = require('./lib/scsp');
