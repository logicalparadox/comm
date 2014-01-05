var Port = comm.Port;
var Queue = comm.Queue;
var Consumer = comm.scsp.Consumer;

test('single message', co(function*() {
  var queue = new Queue();
  var consumer = new Consumer(queue);
  var port = new Port(consumer);

  queue.push([[ null, { hello: 'universe' } ]]);

  var msg = yield port.recv();
  msg.should.deep.equal({ hello: 'universe' });
}));

test('message then end', co(function*() {
  var queue = new Queue();
  var consumer = new Consumer(queue);
  var port = new Port(consumer);
  port.closed.should.be.false;

  queue.push([[ null, { hello: 'universe' }]]);
  queue.push([[ null, null ]]);

  var msg = yield port.recv();
  msg.should.deep.equal({ hello: 'universe' });
  port.closed.should.be.false;

  var msg = yield port.recv();
  assert.equal(msg, null);
  port.closed.should.be.true;
}));
