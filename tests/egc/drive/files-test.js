import DriveFilesMixin from 'egc/egc/drive/files';

var EGC = Em.Object.extend(DriveFilesMixin),
    egc, gapi;

module("DriveFilesMixin", {
  setup: function() {
    gapi = {
      client: {
        drive: { files: {} }
      }
    };
    window.gapi = gapi;
    egc = EGC.create({ driveReady: true, driveVersion: 'v2' });
  }
});

asyncTest("#find, given no args, sends a gapi list request", function() {
  expect(2);

  var files = ['file'];

  gapi.client.drive.files.list = function(args) {
    ok(!args);
    return {
      execute: function(callback) { callback({ items: files }); }
    };
  };

  egc.find().then(function(res) {
    start();
    deepEqual(res, files);
  });
});

asyncTest("#find, given no args, results in [] if no files are found", function() {
  gapi.client.drive.files.list = function(args) {
    return {
      execute: function(callback) { callback({}); }
    };
  };

  egc.find().then(function(res) {
    start();
    deepEqual(res, []);
  });
});

asyncTest("#find, given a query, sends a gapi list request", function() {
  expect(2);

  var files = ['file'],
      query = { q: "'appdata' in parents" };

  gapi.client.drive.files.list = function(args) {
    deepEqual(args, query);
    return {
      execute: function(callback) { callback({ items: files }); }
    };
  };

  egc.find(query).then(function(res) {
    start();
    deepEqual(res, files);
  });
});

asyncTest("#find, given a string argument, sends a gapi get request", function() {
  expect(2);

  var id ='123', file = 'file';

  gapi.client.drive.files.get = function(args) {
    deepEqual(args, { fileId: '123' });
    return { execute: function(callback) { callback(file); } };
  };

  egc.find(id).then(function(res) {
    start();
    equal(res, file);
  });
});

asyncTest("#find, when receiving an error response from gapi, rejects", function() {
  var error = { error: 'nope' };

  gapi.client.drive.files.get = function() {
    return { execute: function(callback) { callback(error); } };
  };

  egc.find('123').then(null, function(res) {
    start();
    equal(res, error);
  });
});

asyncTest("#patch sends a gapi patch request", function() {
  expect(2);

  var file = { id: '123', title: 'file' };

  gapi.client.drive.files.patch = function(args) {
    deepEqual(args, { fileId: '123', resource: file });
    return { execute: function(callback) { callback(file); } };
  };

  egc.patch(file).then(function(res) {
    start();
    equal(res, file);
  });
});

asyncTest("#insert sends a post client request when file contents are present and there's no file id", function() {
  expect(2);
  var file = { mimeType: 'text/plain', content: 'foo' };

  gapi.client.request = function(args) {
    // tested in uploadFile-test
    delete args.headers;
    delete args.body;

    deepEqual(args, {
      path: '/upload/drive/v2/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
    });
    return { execute: function(callback) { callback(file); } };
  };

  egc.insert(file).then(function(res) {
    start();
    deepEqual(res, file);
  });
});

asyncTest("#insert sends a put client request when file contents are present and there is a file id", function() {
  expect(2);
  var file = { id: '1', mimeType: 'text/plain', content: 'foo' };

  gapi.client.request = function(args) {
    // tested in uploadFile-test
    delete args.headers;
    delete args.body;

    deepEqual(args, {
      path: '/upload/drive/v2/files/1',
      method: 'PUT',
      params: { uploadType: 'multipart' },
    });
    return { execute: function(callback) { callback(file); } };
  };

  egc.insert(file).then(function(res) {
    start();
    deepEqual(res, file);
  });
});

asyncTest("#insert sends a gapi patch request if file id is given and there is no content", function() {
  expect(2);

  var file = { id: '123', title: 'file' };

  gapi.client.drive.files.patch = function(args) {
    deepEqual(args, { fileId: '123', resource: file });
    return { execute: function(callback) { callback(file); } };
  };

  egc.insert(file).then(function(res) {
    start();
    equal(res, file);
  });
});

asyncTest("#insert sends a gapi insert request if file id is not given and there is content", function() {
  expect(2);

  var file = { title: 'file' };

  gapi.client.drive.files.insert = function(args) {
    deepEqual(args, { resource: file });
    return { execute: function(callback) { callback(file); } };
  };

  egc.insert(file).then(function(res) {
    start();
    equal(res, file);
  });
});

test("#update is an alias for #insert", function() {
  equal(egc.insert, egc.update);
});

asyncTest("#destroy sends a gapi delete client request", function() {
  expect(2);
  var id ='123', endpoint = '/drive/v2/files/';

  gapi.client.request = function(args) {
    deepEqual(args, { path: (endpoint + id), method: 'DELETE' });
    return { execute: function(callback) { callback({}); } };
  };

  egc.destroy(id).then(function(res) {
    start();
    deepEqual(res, {});
  });
});


