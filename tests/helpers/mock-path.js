import Ember from 'ember';

function mockPath(obj, path, mock, target, callback) {
  if (!callback) {
    callback = target;
    target = null;
  }

  var lastPath, subPath, value;
  var parts = path.split('.');

  // Save all intermediate values while resetting values
  var oldValues = parts.reduce(function(values, part, index) {
    lastPath = values.get('lastObject.path');
    subPath = (lastPath ? lastPath + '.' : '') + part;
    value = Ember.get(obj, subPath);

    values.pushObject({
      path: subPath,
      value: value
    });

    if (index === parts.length - 1) {
      // Set path to mock object
      Ember.set(obj, path, mock);
    } else if (!value) {
      // Make sure the full path can be set by setting falsy intermediate values
      // to new objects
      Ember.set(obj, subPath, {});
    }

    return values;
  }, Ember.A());

  // Invoke callback with given target now that the path is mocked
  callback.call(target);

  // Restore old values in sequence, stopping at the first non-object
  oldValues.every(function(pair) {
    subPath = pair.path;
    value = pair.value;

    if (Ember.get(obj, subPath) !== value) {
      Ember.set(obj, path, value);
    }

    return Ember.typeOf(value) !== 'object';
  });
}

function mockGlobalPath(path, mock, target, callback) {
  mockPath(window || global, path, mock, target, callback);
}

export {
  mockPath,
  mockGlobalPath
};