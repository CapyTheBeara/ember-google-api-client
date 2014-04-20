// TODO - _gapi put in for testing needs to
// handle Em.run.next(). Get rid of it.
export default Em.Mixin.create({
  apiKey: null,
  clientId: null,
  scope: null,

  gapiReady: false,
  apiKeySetOnGapi: false,
  authorized: null,
  accessToken: null,
  _gapi: null,

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
  },

  handlAuthResult: function(res) {
    if (res && !res.error) { return this.set('authorized', true); }
    this.set('authorized', false);
  },

  setAccessToken: function() {
    if (!this.get('authorized')) { return; }

    this.set('accessToken', gapi.auth.getToken().access_token);
  }.observes('authorized'),

});
