test('adds item to queue if no waiting', function(done) {
  co(function*() {
    var arr = new Arr();
    arr.should.have.lengthOf(0);
    arr.push(1);
    arr.should.have.lengthOf(1);
  })(done);
});

test('forwards item to next waiting', function(done) {
  co(function*() {
    var arr = new Arr();
    var next = arr.next();
    var push = yield arr.push(1);
    var res = yield next;
    res.should.equal(1);
  })(done);
});
