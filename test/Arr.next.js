test('waits if no items in queue', function(done) {
  co(function*() {
    var arr = new Arr();
    arr._arrState.waiting.should.have.lengthOf(0);
    var wait = arr.next();
    arr._arrState.waiting.should.have.lengthOf(1);
  })(done);
});

test('resolves if item in queue', function(done) {
  co(function*() {
    var arr = new Arr();
    arr.push('a');
    arr.push('b');
    arr.push('c');

    var a = yield arr.next();
    a.should.equal('a');

    var b = yield arr.next();
    b.should.equal('b');

    var c = yield arr.next();
    c.should.equal('c');
  })(done);
});
