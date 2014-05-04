var Promise = Em.RSVP.Promise;

export default Em.Mixin.create(Em.PromiseProxyMixin, {
  _authResolveReject: null,

  init: function() {
    this._super();

    var promise = new Promise(function(resolve, reject) {
      this.addObserver('authorized', function() {
        var authorized = this.get('authorized');
        if (authorized) { resolve(); }
        if (authorized === false) { reject(); }
      });
    }.bind(this));

    this.set('promise', promise);
  },

});
