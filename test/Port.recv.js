var Port = comm.Port;

test('single message', function(done) {
  var msgs = [ { hello: 'universe' } ];

  var read = co(function*(msg) {
    yield wait(10);
    return msgs.shift();
  });

  co(function*() {
    var port = new Port(read);
    var msg = yield port.recv();
    msg.should.deep.equal({ hello: 'universe' });
  })(done);
});

test('message then end', function(done) {
  var msgs = [ { hello: 'universe' }, null ];

  var read = co(function*(msg) {
    yield wait(10);
    return msgs.shift();
  });

  co(function*() {
    var port = new Port(read);
    port.closed.should.be.false;

    var msg = yield port.recv();
    msg.should.deep.equal({ hello: 'universe' });
    port.closed.should.be.false;

    var msg = yield port.recv();
    assert.equal(msg, null);
    port.closed.should.be.true;
  })(done);
});
