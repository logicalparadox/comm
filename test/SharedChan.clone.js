var Chan = comm.Chan;
var SharedChan = comm.SharedChan;

test('returns a new Chan', function() {
  var chan = new SharedChan(function() {});
  var clone = chan.clone();
  clone.should.be.instanceof(Chan);
});
