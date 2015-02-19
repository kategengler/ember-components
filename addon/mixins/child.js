import Ember from 'ember';

var Mixin    = Ember.Mixin;
var get      = Ember.get;
var set      = Ember.set;
var computed = Ember.computed;
var assert   = Ember.assert;

export default Mixin.create({
  //
  // Internal Properties
  //

  parent: computed.alias('parentView'),

  //
  // Hooks / Observers
  //

  // Register self with parent component
  willInsertElement: function(view) {
    this._super(view);

    var parent = get(this, 'parent');

    if (!get(this, 'canBeTopLevel')) {
      assert("The '" + get(this, 'tagName') + "' component must be nested underneath another component'", parent && typeof parent.registerComponent === 'function');
    }

    parent && parent.registerComponent && parent.registerComponent(this);
  },

  // Notify parent of insertion into DOM
  didInsertElement: function(view) {
    this._super(view);

    var parent = get(this, 'parent');
    parent && parent.didInsertComponent && parent.didInsertComponent(this);
  }
});
