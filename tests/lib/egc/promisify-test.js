import PromisifyMixin from 'egc/lib/egc/promisify';

var EGC = Em.Object.extend(PromisifyMixin),
    egc;

module("PromisifyMixin", {
  setup: function() {
    egc = EGC.create({ authorized: null });
  }
});

test("egc is a promise", function() {
  ok(egc.then);
});

test("egc is pending if authorized is null", function() {
  ok(egc.get('isPending'));
});

asyncTest("egc is settled if authorized is true", function() {
  egc.then(function() {
    start();
    ok(egc.get('isSettled'));
  });

  egc.set('authorized', true);
});

asyncTest("egc is rejected if authorized is false", function() {
  egc.catch(function() {
    start();
    ok(egc.get('isRejected'));
  });

  egc.set('authorized', false);
});
