
// utilities (should be extracted)
exports.Queue = require('./lib/queue').Queue;
exports.DistributedQueue = require('./lib/queue.distributed').DistributedQueue;

// channels
exports.Chan = require('./lib/chan').Chan;
exports.SharedChan = require('./lib/chan.shared').SharedChan;

// ports
exports.Port = require('./lib/port').Port;
exports.SharedPort = require('./lib/port.shared').SharedPort;

// sugar
exports.Duplex = require('./lib/duplex').Duplex;

// stuffs
exports.scsp = require('./lib/scsp');
