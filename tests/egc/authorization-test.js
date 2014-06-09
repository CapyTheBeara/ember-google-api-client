import AuthorizationMixin from 'egc/egc/authorization';

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

asyncTest("authorized is false if immediate authorization attempt fails", function() {
  gapi.auth.authorize = function(params, callback) {
    callback({ error: 'nope' });
    start();

    equal(egc.get('authorized'), false);
  };

  createEgc();
});

asyncTest("authorized is true if immediate authorization attempt succeeds", function() {
  gapi.auth.authorize = function(params, callback) {
    callback({});
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
  ok(!egc.get('accessToken'))
});
