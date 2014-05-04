export default Em.Mixin.create({
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
