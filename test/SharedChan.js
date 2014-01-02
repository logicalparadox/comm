var SharedChan = comm.SharedChan;
var Port = comm.Port;

test('returns array of [ port, sharedchan ]', function() {
  var sock = SharedChan();
  sock.should.be.an('array');
  sock[0].should.be.instanceof(Port);
  sock[1].should.be.instanceof(SharedChan);
});

test('delivery with single clone', function(done) {
  function *send(chan) {
    yield chan.send('a');
    yield chan.send('b');
    yield chan.send('c');
  }

  co(function*() {
    var sock = SharedChan();
    var port = sock[0];
    var chan = sock[1].clone();

    co(send)(chan);

    var a = yield port.recv();
    var b = yield port.recv();
    var c = yield port.recv();
    [ a, b, c ].should.deep.equal([ 'a', 'b', 'c' ]);

    sock[1].closed.should.be.false;
    port.closed.should.be.false;

    chan.send(null);
    var exit = yield port.recv();
    assert.equal(exit, null);

    chan.closed.should.be.true;
    sock[1].closed.should.be.true;
    port.closed.should.be.true;
  })(done);
});

test('deliver with multiple clones', function(done) {
  co(function*() {
    var sock = SharedChan();
    var port = sock[0];

    var chana = sock[1].clone();
    var chanb = sock[1].clone();
    var chanc = sock[1].clone();

    chana.send('a');
    chanb.send('b');
    chanc.send('c');

    var a = yield port.recv();
    var b = yield port.recv();
    var c = yield port.recv();
    [ a, b, c ].should.deep.equal([ 'a', 'b', 'c' ]);

    sock[1].closed.should.be.false;
    port.closed.should.be.false;

    yield chana.send(null);
    chana.closed.should.be.true;
    chanb.closed.should.be.false;
    chanc.closed.should.be.false;
    sock[1].closed.should.be.false;
    port.closed.should.be.false;

    yield chanb.send(null);
    chana.closed.should.be.true;
    chanb.closed.should.be.true;
    chanc.closed.should.be.false;
    sock[1].closed.should.be.false;
    port.closed.should.be.false;

    chanc.send(null);
    var exit = yield port.recv();
    assert.equal(exit, null);

    chana.closed.should.be.true;
    chanb.closed.should.be.true;
    chanc.closed.should.be.true;
    sock[1].closed.should.be.true;
    port.closed.should.be.true;
  })(done);
});
