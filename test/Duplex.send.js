var Chan = comm.Chan;
var Duplex = comm.Duplex;

test('sends messages', function(done) {
  co(function*() {
    var pair = Chan();
    var duplex = new Duplex(pair);

    duplex.send('a');
    duplex.send('b');
    duplex.send('c');

    var a = yield pair[0].recv();
    var b = yield pair[0].recv();
    var c = yield pair[0].recv();

    [ a, b, c ].should.deep.equal([ 'a', 'b', 'c' ]);
  })(done);
});
