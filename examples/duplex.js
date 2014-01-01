// external
var co = require('co');

// internal
var DuplexStream = require('../index').DuplexStream;

/**
 * Generator performing calculation. Uses
 * a while-yield loop to collect data then
 * responds when no more data will be recieved.
 *
 * @param {DuplexStream} duplex channel
 */

function *calc(chan) {
  var sum = 0, num;

  while (num = yield chan.recv()) {
    if (null == num) break;
    sum += num;
  }

  chan.send(sum);
  chan.send(null);
}

/**
 * Create `DuplexStream` pair. Use one
 * as local rpc channel. Send other to
 * `calc` as the duplex to listen and
 * respond on.
 */

co(function *main() {
  var sock = DuplexStream();
  var req = sock[0];

  co(calc)(sock[1]);

  req.send(2 * 10);
  req.send(2 * 20);
  req.send(2 * 30);
  req.send(null);

  var res = yield req.recv();
  console.log(res);
})();
