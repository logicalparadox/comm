var co = require('co');
var DuplexStream = require('../index').DuplexStream;

var calc = co(function*(chan) {
  var sum = 0, num;

  while (num = yield chan.recv()) {
    if (null == num) break;
    sum += num;
  }

  chan.send(sum);
  chan.send(null);
});

exports.main = co(function*() {
  var sock = DuplexStream();
  var rpc = sock[0];

  calc(sock[1]);

  rpc.send(2 * 10);
  rpc.send(2 * 20);
  rpc.send(2 * 30);
  rpc.send(null);

  var res = yield rpc.recv();
  console.log(res);
})();
