import { handleGapiResponse } from 'egc/lib/egc/utils';
import uploadFile from 'egc/lib/egc/drive/uploadFile';

var Promise = Em.RSVP.Promise,
    a_slice = Array.prototype.slice;

function extractItems(res) {
  if (res.items) { return res.items; }
  return [];
}

// assumes driveReady is true when requests are made
export default Em.Mixin.create({
  DEBUG: false,
  driveVersion: 'v2', // also in DriveMixin

  find: function(args) {
    var self = this;

    if (!args) {
      return this.request('list').then(extractItems);
    }

    if (typeof args === 'string') {
      return this.request('get', { fileId: args });
    }

    if (typeof args === 'object') {
      return this.request('list', args).then(extractItems);
    }
  },

  insert: function(file) {
    if (file.content) {
      var params = {
        version: this.get('driveVersion'),
        DEBUG: this.get('DEBUG')
      };
      return uploadFile(file, params);
    }

    if (file.id) { return this.patch(file); }
    return this.request('insert', { resource: file });
  },

  update: Em.aliasMethod('insert'),

  patch: function(file) {
    return this.request('patch', { fileId: file.id, resource: file });
  },

  // Google's gapi client sends a POST request instead of DELETE
  destroy: function(id) {
    var path = '/drive/' + this.get('driveVersion') + '/files/' + id,
        DEBUG = this.get('DEBUG');

    return new Promise(function(resolve, reject) {
      gapi.client.request({ path: path, method: 'DELETE' })
                 .execute(handleGapiResponse(resolve, reject, DEBUG));
    });
  },

  request: function() {
    var args = a_slice.call(arguments),
        method = args[0],
        rest = args.slice(1),
        DEBUG = this.get('DEBUG');

    return new Promise(function(resolve, reject) {
      if (DEBUG) { console.log('sending gapi request', args);}

      gapi.client.drive
          .files[method].apply(null, rest)
          .execute(handleGapiResponse(resolve, reject, DEBUG));
    });
  }
});
