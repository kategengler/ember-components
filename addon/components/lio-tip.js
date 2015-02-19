import { tagForType } from '../util/namespace';
import ParentComponentMixin from '../mixins/parent';
import ActiveStateMixin from '../mixins/active-state';
import Ember from 'ember';

var A         = Ember.A;
var Component = Ember.Component;
var get       = Ember.get;
var set       = Ember.set;
var observer  = Ember.observer;
var computed  = Ember.computed;
var assert    = Ember.assert;

var typeKey = 'tip';

/**
  Tip Component

  This component hides and shows contextual information for a given label.
  When this label is given focus, the content is shown. Likewise, on blur, the
  content is hidden.

  ```handlebars
  {{#lio-tip}}
    {{lio-label}}
    {{lio-popover}}
  {{/lip-tip}}
  ```
*/
// TODO debt: currently, a div in the popover of a tip that is in a paragraph will
// break the universe. The popover component needs to be moved elsewhere in the DOM
export default Component.extend(ParentComponentMixin, ActiveStateMixin, {
  //
  // HTML Properties
  //

  tagName: tagForType(typeKey),

  //
  // Handlebars Attributes
  //

  activator: 'click',
  bubbles: true,

  //
  // Internal Properties
  //

  typeKey: typeKey,

  allowedComponents: [ 'content', 'popover', 'label' ],

  fromFocus: false,

  togglePopover: observer('active', function() {
    set(get(this, 'popover'), 'active', get(this, 'active'));
  }),

  label: computed(function() {
    return get(this.componentsForType('label'), 'firstObject');
  }).property(),

  popover: computed(function() {
    return get(this.componentsForType('popover'), 'firstObject');
  }).property(),

  shouldBubble: computed.bool('bubbles'),

  //
  // Internal Actions
  //

  actions: {
    // Prevent errors when labels are clicked
    labelFocus: Ember.K
  },

  //
  // Event Handlers
  //

  click: function(event) {
    if (get(this, 'fromFocus')) {
      set(this, 'fromFocus', false);
      return get(this, 'shouldBubble');
    }
    if (get(this, 'activator') === 'click') {
      this.send('toggleActive');
    }
    return get(this, 'shouldBubble');
  },

  mouseEnter: function() {
    if (get(this, 'activator') === 'hover') {
      this.send('activate');
    }
    return get(this, 'shouldBubble');
  },

  mouseLeave: function() {
    if (get(this, 'activator') === 'hover') {
      this.send('deactivate');
    }
    return get(this, 'shouldBubble');
  },

  focusIn: function() {
    set(this, 'fromFocus', true);
    this.send('activate');
    return get(this, 'shouldBubble');
  },

  keyPress: function(event) {
    if (event.which === 13) {
      this.send('toggleActive');
    } else if (event.which === 27) {
      this.send('deactivate');
    }
    return get(this, 'shouldBubble');
  },

  //
  // Hooks / Observers
  //

  // Verify dependencies and auto-set options on child popover
  didRegisterComponents: function() {
    this._super();

    var labelsLength = get(this.componentsForType('label'), 'length');
    var popoversLength = get(this.componentsForType('popover'), 'length');
    assert(Ember.String.fmt("The '%@' component must have a single 'lio-label' and a single 'lio-popover'", [ get(this, 'tagName') ]), labelsLength === 1 && popoversLength === 1);

    set(get(this, 'popover'), 'anchor', get(this, 'label').$());
    set(get(this, 'popover'), 'alignToParent', true);

    var component = this;
    var handler = function(event) {
      if (component.get('active') && !withinComponent(event.target, component.$().add(component.get('anchor')))) {
        component.set('active', false);
      }
    };

    this.set('windowClickHandler', handler);
    $(window).on('click.lio', handler);
  },

  willDestroyElement: function() {
    $(window).off('click.lio', this.get('windowClickHandler'));
  }
});

function withinComponent(target, $elements) {
  return A($elements.toArray()).any(function(el) {
    return target === el || $.contains(el, target);
  });
}