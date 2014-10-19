import Em from 'ember';
import ReadyMixin from './egc/ready';
import AuthorizationMixin from './egc/authorization';
import DriveMixin from './egc/drive';

var EGC = Em.Object.extend(
  ReadyMixin,
  AuthorizationMixin,
  DriveMixin, {

  DEBUG: true,
  getScript: Em.$.getScript
});

Em.EGC = EGC;
export default EGC;
