var Chan = comm.Chan;
var Duplex = comm.Duplex;

test('recieves messages', function(done) {
  co(function*() {
    var pair = Chan();
    var duplex = new Duplex(pair);

    pair[1].send('a');
    pair[1].send('b');
    pair[1].send('c');

    var a = yield duplex.recv();
    var b = yield duplex.recv();
    var c = yield duplex.recv();

    [ a, b, c ].should.deep.equal([ 'a', 'b', 'c' ]);
  })(done);
});
