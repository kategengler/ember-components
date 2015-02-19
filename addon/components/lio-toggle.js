import { tagForType } from '../util/namespace';
import ParentComponentMixin from '../mixins/parent';
import Ember from 'ember';

var Component = Ember.Component;
var get       = Ember.get;
var set       = Ember.set;
var run       = Ember.run;
var computed  = Ember.computed;
var assert    = Ember.assert;

var typeKey = 'toggle';

/**
  Toggle Component

  This component switches its value between two options. The possible values
  are taken from the `value` attribute of each option. When the component is
  'toggled', its value is changed to that of the next option.  At any given
  time the option with the value that matches the component's is marked as
  active.

  ```handlebars
  {{#lio-toggle defaultValue=false}}
    {{#lio-option value=true}}Yes{{/lio-option}}
    {{#lio-option value=false}}No{{/lio-option}}
  {{/lio-toggle}}
  ```
*/
export default Component.extend(ParentComponentMixin, {
  //
  // HTML Properties
  //

  tagName: tagForType(typeKey),

  classNameBindings: [ 'valueClass', 'disabled' ],

  //
  // Handlebars Attributes
  //

  disabled: false,

  defaultValue: false,

  value: computed.oneWay('defaultValue'),

  //
  // Internal Properties
  //

  typeKey: typeKey,

  allowedComponents: [ 'option' ],

  valueClass: computed(function() {
    return '' + get(this, 'value');
  }).property('value'),

  possibleValues: computed(function() {
    return this.componentsForType('option').mapBy('value');
  }).property('components.[]'),

  //
  // Internal Actions
  //

  actions: {
    toggle: function() {
      if (!get(this, 'disabled')) {
        run(this, function() {
          var current = get(this, 'value');
          var possible = get(this, 'possibleValues');
          var nextIndex = possible.indexOf(current) + 1;

          // Wrap around to the first value
          if (nextIndex === get(possible, 'length')) {
            nextIndex = 0;
          }

          set(this, 'value', possible[nextIndex]);
        });

        this.sendAction('action', get(this, 'value'));
      }
    },

    // Prevent errors when options are clicked, but let the toggle action
    // handle actual state change
    select: Ember.K
  },

  //
  // Event Handlers
  //

  click: function() {
    this.send('toggle');
  },

  keyPress: function(event) {
    if (event.which === 13) {
      this.send('toggle');
    }
  },

  //
  // Hooks / Observers
  //

  // Verify dependencies and initialize the default value
  didRegisterComponents: function() {
    this._super();

    assert("The '" + get(this, 'tagName') + "' component must contain at exactly two 'lio-option' components.", get(this.componentsForType('option'), 'length') === 2);

    var value = get(this, 'value');
    var defaultValue = get(this, 'defaultValue');

    // Only set the default if there's currently no value
    if (value === undefined && defaultValue !== undefined) {
      set(this, 'value', defaultValue);
    }
  }
});
