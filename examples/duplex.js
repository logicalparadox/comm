// external
var co = require('co');

// internal
var Duplex = require('../index').Duplex;

/**
 * Generator performing calculation. Uses
 * a while-yield loop to collect data then
 * responds when no more data will be recieved.
 *
 * @param {Duplex} duplex channel
 */

function *calc(chan) {
  var sum = 0, num;

  while (num = yield chan.recv()) {
    sum += num;
  }

  chan.send(sum);
  chan.send(null);
}

/**
 * Create `Duplex` pair. Use one
 * as local rpc channel. Send other to
 * `calc` as the duplex to listen and
 * respond on.
 */

co(function *main() {
  var sock = Duplex();
  var req = sock[0];

  co(calc)(sock[1]);

  req.send(2 * 10);
  req.send(2 * 20);
  req.send(2 * 30);
  req.send(null);

  var res = yield req.recv();
  console.log(res);
})();
