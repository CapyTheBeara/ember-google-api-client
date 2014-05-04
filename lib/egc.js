import ReadyMixin from 'egc/egc/ready';
import AuthorizationMixin from 'egc/egc/authorization';
import PromisifyMixin from 'egc/egc/promisify';
import DriveMixin from 'egc/egc/drive';

var EGC = Em.Object.extend(
  ReadyMixin,
  AuthorizationMixin,
  PromisifyMixin,
  DriveMixin, {

  DEBUG: true,
  getScript: $.getScript
});

Ember.EGC = EGC;
export default EGC;
