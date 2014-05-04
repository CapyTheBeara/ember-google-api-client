import DriveMixin from 'egc/egc/drive';

var EGC = Em.Object.extend(DriveMixin),
    egc, gapi;

module("DriveMixin", {
  setup: function() {
    gapi = {
      client: {
        load: Em.K
      }
    };
    egc = EGC.create();
    window.gapi = gapi;
  },
  teardown: function() {
    delete window.gapi;
  }
});

test("driveReady is false before drive is loaded into gapi", function() {
  ok(!egc.get('driveReady'));
});

test("loads drive into gapi when apiKey has been set on gapi", function() {
  expect(3);

  gapi.client.load = function(resource, version, callback) {
    callback();

    equal(resource, 'drive');
    equal(version, 'v2');
    equal(egc.get('driveReady'), true);
  };

  egc.set('apiKeySetOnGapi', true);

});


