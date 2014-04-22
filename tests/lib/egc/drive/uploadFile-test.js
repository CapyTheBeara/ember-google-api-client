import uploadFile from 'egc/lib/egc/drive/uploadFile';

var reqObj = { execute: Em.K },
    gapi;

module("uploadFile", {
  setup: function() {
    gapi = {
      client: {
        request: function() { return reqObj; }
      }
    };
    window.gapi = gapi;
  },
  teardown: function() {
    delete window.gapi;
  }
});

test("file argument is required", function() {
  throws(
    function() { uploadFile(); },
    Error
  );
});


test("a Drive API version can be specified", function() {
  gapi.client.request = function(args) {
    equal(args.path, '/upload/drive/v1/files');

    return reqObj;
  };
  uploadFile({}, { version: 'v1' });
});

test("defaults to multipart POST request)", function() {
  gapi.client.request = function(args) {
    delete args.body;

    deepEqual(args, {
      path: '/upload/drive/v2/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: { 'Content-Type': 'multipart/related; boundary="foo_bar_baz"' }
    });

    return reqObj;
  };

  uploadFile({});
});

test("request body is correct for a mutiplart request", function() {
  var specFile = { title: 'my_file', mimeType: 'application/json' },
      boundary = "foo_bar_baz",
      delimiter = "\r\n--" + boundary + "\r\n",
      closeDelimeter = "\r\n--" + boundary + "--";

  var body = delimiter +
             'Content-Type: application/json\r\n\r\n' +
             JSON.stringify(specFile) +
             delimiter +
             'Content-Type: ' + specFile.mimeType + '\r\n\r\n' +
             'shazam' +
             closeDelimeter;

  gapi.client.request = function(args) {
    equal(args.body, body);

    return reqObj;
  };

  uploadFile( Em.merge(specFile, { content: 'shazam' }) );
});

test("an id param gets included in the path and method is set to PUT", function() {
  gapi.client.request = function(args) {
    equal(args.path, '/upload/drive/v2/files/1');
    equal(args.method, 'PUT');

    return reqObj;
  };

  uploadFile({ id: '1' });
});

test("a simple media upload can be specified", function() {
  gapi.client.request = function(args) {
    deepEqual(args, {
      path: '/upload/drive/v2/files/1',
      method: 'PUT',
      params: { uploadType: 'media' },
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': 6
      },
      body: 'shazam'
    });

    return reqObj;
  };

  uploadFile(
    { id: '1', mimeType: 'image/jpeg', content: 'shazam' },
    { uploadType: 'media' }
  );
});

asyncTest("response is resolved", function() {
  var file = { title: 'foo' };
  gapi.client.request = function() {
    return {
      execute: function(callback) {
        return callback(file); }
      };
  };

  uploadFile(file).then(function(res) {
    start();
    equal(res, file);
  })
});

asyncTest("error response is rejected", function() {
  var resp = { error: 'nope' };
  gapi.client.request = function() {
    return {
      execute: function(callback) {
        return callback(resp); }
      };
  };

  uploadFile({}).catch(function(res) {
    start();
    equal(res, resp);
  })
});
