var Chan = comm.Chan;
var SharedChan = comm.SharedChan;

test('returns a new Chan', function(done) {
  var register = co(function*(key) {
    yield wait(10);
  });

  co(function*() {
    var chan = new SharedChan(register, function() {});
    var clone = yield chan.clone();
    clone.should.be.instanceof(Chan);
  })(done);
});
