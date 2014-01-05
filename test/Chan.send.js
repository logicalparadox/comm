var Chan = comm.Chan;
var Queue = comm.Queue;
var Producer = comm.scsp.Producer;

test('single message', co(function*() {
  var queue = new Queue();
  var producer = new Producer(queue);
  var chan = new Chan(producer);

  var send = chan.send({ hello: 'universe' });
  queue.should.have.lengthOf(1);

  var msg = yield queue.shift();
  msg[0][1].should.deep.equal({ hello: 'universe' });
  msg[1](); // confirm recieve

  var sent = yield send;
  sent.should.be.true;
}));

test('message then end', co(function*() {
  var queue = new Queue();
  var producer = new Producer(queue);
  var chan = new Chan(producer);
  chan.closed.should.be.false;

  var one = chan.send({ hello: 'universe' });
  chan.closed.should.be.false;

  var exit = chan.send(null);
  chan.closed.should.be.true;

  queue.should.have.lengthOf(2)

  var mone = yield queue.shift();
  mone[0][1].should.deep.equal({ hello: 'universe' });
  mone[1]();

  var mexit = yield queue.shift();
  assert.equal(mexit[0][1], null);
  mexit[1]();

  one = yield one;
  exit = yield exit;
  one.should.be.true;
  exit.should.be.true;
}));
