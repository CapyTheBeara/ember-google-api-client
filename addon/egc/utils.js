import Em from 'ember';

export function handleGapiResponse(resolve, reject, DEBUG) {
  return function(res) {
    if (DEBUG) { console.log('gapi response', res); }
    if (res && res.error) { return Em.run(null, reject, res); }
    Em.run(null, resolve, res);
  };
}
