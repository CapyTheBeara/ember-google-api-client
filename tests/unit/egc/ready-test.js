import Em from 'ember';
import ReadyMixin from 'ember-google-api-client/egc/ready';

var EGC = Em.Object.extend(ReadyMixin),
    egc;

module("ReadyMixin", {
  setup: function() {
    egc = EGC.create();
  },
  teardown: function() {
    delete window.gapi;
    delete window.gapiReady;
  }
});

test("is ready on create when window.gapi exists", function() {
  window.gapi = {};
  var egc = EGC.create();
  ok(egc.get('gapiReady'));
});

test("is not ready on create when window.gapi does not exist", function() {
  ok(!egc.get('gapiReady'));
});

test("sets window.gapiReady when window.gapi does not exist", function() {
  ok(window.gapiReady);
});

test("becomes ready when window.gapiReady is called", function() {
  window.gapiReady();
  ok(egc.get('gapiReady'));
});

test("will call getScript with gapi source URL if window.gapi does not exist", function() {
  var getScript = function(url) { equal(url, egc.get('gapiSourceUrl')); };
  EGC.create({getScript: getScript});
});
