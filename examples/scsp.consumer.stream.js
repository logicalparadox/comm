var co = require('co');
var transmute = require('transmute');

var comm = require('..');
var StreamConsumer = comm.scsp.StreamConsumer;

co(function *main() {
  var stream = transmute({ options: { objectMode: true, highWaterMark: 1 }});
  var consumer = new StreamConsumer(stream);

  stream.write({ hello: 'universe' });
  stream.end();

  var res = yield consumer.read();
  console.log(res);
  var end = yield consumer.read();
  console.log(end);
})();
