define("egc/egc",
  ["egc/egc/ready","egc/egc/authorization","egc/egc/drive","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var ReadyMixin = __dependency1__["default"];
    var AuthorizationMixin = __dependency2__["default"];
    var DriveMixin = __dependency3__["default"];

    var EGC = Em.Object.extend(
      ReadyMixin,
      AuthorizationMixin,
      DriveMixin, {

      DEBUG: true,
      getScript: $.getScript
    });

    Ember.EGC = EGC;
    __exports__["default"] = EGC;
  });define("egc/egc/ready",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Em.Mixin.create({
      gapiSourceUrl: 'https://apis.google.com/js/client.js?onload=gapiReady',
      getScript: null,  // ie. $.getScript if using jQuery
      gapiReady: false,

      init: function() {
        this._super();
        if (window.gapi) { return this.setReady(); }
        window.gapiReady = this.setReady.bind(this);
      },

      setReady: function() {
        this.set('gapiReady', true);
      },

      fetchGapi: function() {
        var getScript = this.get('getScript');
        if (getScript) { getScript(this.get('gapiSourceUrl')); }
      }.observes('getScript', 'gapiSourceUrl').on('init')
    });
  });define("egc/egc/authorization",
  ["exports"],
  function(__exports__) {
    "use strict";
    // TODO - _gapi put in for testing needs to
    // handle Em.run.next(). Get rid of it.

    var Promise = Em.RSVP.Promise;

    __exports__["default"] = Em.Mixin.create(Em.PromiseProxyMixin, {
      apiKey: null,
      clientId: null,
      scope: null,

      gapiReady: false,
      apiKeySetOnGapi: false,
      authorized: null,
      accessToken: null,
      _gapi: null,

      init: function() {
        this._super();
        this.setPromise();
      },

      setPromise: function() {
        var promise = new Promise(function(resolve, reject) {
          this.addObserver('authorized', function() {
            var authorized = this.get('authorized');
            if (authorized) { resolve(); }
            if (authorized === false) { reject(); }
          });
        }.bind(this));

        this.set('promise', promise);
      },

      setApiKey: function() {
        if (!this.get('gapiReady')) { return; }

        var apiKey = this.get('apiKey');
        if (!apiKey) { return; }

        gapi.client.setApiKey(apiKey);
        this.setProperties({ _gapi: gapi, apiKeySetOnGapi: true });
        Em.run.next(this, function() { this.authorize(true); });
      }.observes('gapiReady').on('init'),

      authorize: function(now) {
        this.get('_gapi').auth.authorize({
          client_id: this.get('clientId'),
          scope: this.get('scope'),
          immediate: now
        }, this.handlAuthResult.bind(this));

        this.setPromise();
        return this;
      },

      handlAuthResult: function(res) {
        if (res && res.access_token) { return this.set('authorized', true); }
        this.set('authorized', false);
      },

      setAccessToken: function() {
        if (!this.get('authorized')) { return; }

        this.set('accessToken', gapi.auth.getToken().access_token);
      }.observes('authorized'),

    });
  });define("egc/egc/drive",
  ["egc/egc/drive/files","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var FilesMixin = __dependency1__["default"];

    __exports__["default"] = Em.Mixin.create(
      FilesMixin, {

      driveVersion: 'v2',
      apiKeySetOnGapi: false,
      driveReady: false,

      loadDrive: function() {
        if (!this.get('apiKeySetOnGapi')) { return; }

        gapi.client.load('drive', this.get('driveVersion'), function() {
          this.set('driveReady', true);
        }.bind(this));
      }.observes('apiKeySetOnGapi')

    });
  });define("egc/egc/drive/files",
  ["egc/egc/utils","egc/egc/drive/uploadFile","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var handleGapiResponse = __dependency1__.handleGapiResponse;
    var uploadFile = __dependency2__["default"];

    var Promise = Em.RSVP.Promise,
        a_slice = Array.prototype.slice;

    function extractItems(res) {
      if (res.items) { return res.items; }
      return [];
    }

    // assumes driveReady is true when requests are made
    __exports__["default"] = Em.Mixin.create({
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
  });define("egc/egc/utils",
  ["exports"],
  function(__exports__) {
    "use strict";
    function handleGapiResponse(resolve, reject, DEBUG) {
      return function(res) {
        if (DEBUG) { console.log('gapi response', res); }
        if (res && res.error) { return Em.run(null, reject, res); }
        Em.run(null, resolve, res);
      };
    }

    __exports__.handleGapiResponse = handleGapiResponse;
  });define("egc/egc/drive/uploadFile",
  ["egc/egc/utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var handleGapiResponse = __dependency1__.handleGapiResponse;

    var boundary = 'foo_bar_baz',
        delimiter = "\r\n--" + boundary + "\r\n",
        closeDelimeter = "\r\n--" + boundary + "--";

    function createRequestBody(file) {
      var specFile = Em.copy(file);
      delete specFile.content;

      return delimiter +
             'Content-Type: application/json\r\n\r\n' +
             JSON.stringify(specFile) +
             delimiter +
             'Content-Type: ' + file.mimeType + '\r\n\r\n' +
             file.content +
             closeDelimeter;
    }

    function uploadFile(file, opts) {
      var version = 'v2', uploadPath, params;

      if (!file) { throw new Error('A file resource is required.'); }
      if (opts && opts.version) { version = opts.version; }
      uploadPath = '/upload/drive/' + version + '/files';

      params = {
        path: uploadPath,
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        }
      };

      if (opts) {
        if (opts.uploadType) { params.params.uploadType = opts.uploadType; }
        if (opts.contentType) { params.headers['Content-Type'] = opts.contentType; }
        if (opts.contentLength) { params.headers['Content-Length'] = opts.contentLength; }
        if (opts.uploadType === 'media') {
          if (file.mimeType) {
            params.headers['Content-Type'] = file.mimeType;
          }

          if (file.content) {
            params.body = file.content;
            params.headers['Content-Length'] = file.content.length;
          }
        }
      }

      if (file.id) {
        params.path += '/' + file.id;
        params.method = 'PUT';
      }

      if (params.params.uploadType === 'multipart') {
        params.body = createRequestBody(file);
      }

      return new Em.RSVP.Promise(function(resolve, reject) {
        gapi.client.request(params)
                   .execute(handleGapiResponse(resolve, reject, (opts && opts.DEBUG)));
      });
    };

    __exports__["default"] = uploadFile;
  });
