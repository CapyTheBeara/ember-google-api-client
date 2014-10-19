/*global gapi*/
import Em from 'ember';
import FilesMixin from './drive/files';

export default Em.Mixin.create(
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
