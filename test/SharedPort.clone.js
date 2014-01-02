var Port = comm.Port;
var SharedPort = comm.SharedPort;

test('returns a new Chan', function(done) {
  var register = co(function*(key) {
    yield wait(10);
  });

  co(function*() {
    var port= new SharedPort(register, function() {});
    var clone = yield port.clone();
    clone.should.be.instanceof(Port);
  })(done);
});
