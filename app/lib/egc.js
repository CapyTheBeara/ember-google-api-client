import ReadyMixin from 'egc/lib/egc/ready';
import AuthorizationMixin from 'egc/lib/egc/authorization';
import PromisifyMixin from 'egc/lib/egc/promisify';
import DriveMixin from 'egc/lib/egc/drive';

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
