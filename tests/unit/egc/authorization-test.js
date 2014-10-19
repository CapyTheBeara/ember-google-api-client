import Em from 'ember';
import AuthorizationMixin from 'ember-google-api-client/egc/authorization';

var EGC = Em.Object.extend(AuthorizationMixin),
    egc, gapi;

function createEgc(params) {
  egc = EGC.create({
    apiKey: '1',
    clientId: '2',
    scope: 'foo',
    gapiReady: true
  });
}

module("AuthorizationMixin", {
  setup: function() {
    gapi = {
      client: { setApiKey: Em.K },
      auth: {
        authorize: Em.K,
        getToken: Em.K
      }
    };
    window.gapi = gapi;
  },
  teardown: function() {
    delete window.gapi;
    egc = null;
  }
});

test("apiKey gets set on the gapi client", function() {
  gapi.client.setApiKey = function(key) { equal(key, '1'); };
  createEgc();
  ok(egc.get('apiKeySetOnGapi'));
});

asyncTest("an immediate gapi authorization attempt is made", function() {
  var params = { client_id: '2', scope: 'foo', immediate: true };
  gapi.auth.authorize = function(p) { deepEqual(p, params); start(); };
  createEgc();
});

test("authorized starts off as null", function() {
  createEgc();
  equal(egc.get('authorized'), null);
});

asyncTest("authorized is false if immediate authorization attempt does not respond with an access_token", function() {
  gapi.auth.authorize = function(params, callback) {
    callback({});
    start();

    equal(egc.get('authorized'), false);
  };

  createEgc();
});

asyncTest("authorized is true if immediate authorization responds with an access_token", function() {
  gapi.auth.authorize = function(params, callback) {
    callback({ access_token: 'foo' });

    equal(egc.get('authorized'), true);
    start();
  };

  createEgc();
});

test("accessToken is set if authorized", function() {
  gapi.auth.getToken = function() {
    return { access_token: 'token' };
  };

  createEgc();
  egc.set('authorized', true);
  equal(egc.get('accessToken'), 'token');
});

test("accessToken is not set if unauthorized", function() {
  gapi.auth.getToken = function() {};

  createEgc();
  egc.set('authorized', false);
  ok(!egc.get('accessToken'));
});


// Promise behavior

test("egc is pending if authorized is null", function() {
  createEgc();
  ok(egc.get('isPending'));
});

asyncTest("egc is settled if authorized is true", function() {
  createEgc();

  egc.then(function() {
    start();
    ok(egc.get('isSettled'));
  });

  egc.set('authorized', true);
});

asyncTest("egc is rejected if authorized is false", function() {
  createEgc();

  egc.catch(function() {
    start();
    ok(egc.get('isRejected'));
  });

  egc.set('authorized', false);
});

asyncTest("#authorize resets the promise to pending", function() {
  expect(2);

  createEgc();

  egc.catch(function() {
    start();
    ok(egc.get('isSettled'));

    egc.authorize();
    ok(egc.get('isPending'));
  });

  egc.set('authorized', false);
});

asyncTest("#authorize returns a promise that is settled if authorized is true", function() {
  createEgc();

  egc.authorize().then(function() {
    start();
    ok(egc.get('isSettled'));
  });

  egc.set('authorized', true);
});

asyncTest("#authorize returns a promise that is rejected if authorized is false", function() {
  createEgc();

  egc.authorize().catch(function() {
    start();
    ok(egc.get('isRejected'));
  });

  egc.set('authorized', false);
});
