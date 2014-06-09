import ReadyMixin from 'egc/egc/ready';
import AuthorizationMixin from 'egc/egc/authorization';
import DriveMixin from 'egc/egc/drive';

var EGC = Em.Object.extend(
  ReadyMixin,
  AuthorizationMixin,
  DriveMixin, {

  DEBUG: true,
  getScript: $.getScript
});

Ember.EGC = EGC;
export default EGC;
