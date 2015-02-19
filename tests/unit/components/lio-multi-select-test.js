import Ember from "ember";
import {
  test,
  moduleForComponent
} from 'ember-qunit';
import compileTemplate from '../../helpers/compile-template';
import tagNameFor from '../../helpers/tag-name-for';

moduleForComponent('lio-multi-select', 'MultiSelectComponent', {
  needs: [
    'component:lio-option',
    'component:lio-button',
    'component:lio-filter',
    'component:lio-text-field',
  ]
});

var defaultTemplate = compileTemplate(function() {/*
  {{lio-option value=1}}
  {{lio-option value=2}}
  {{lio-option value=3}}
*/});

test("component has correct tag name", function() {
  var component = this.subject({
    layout: defaultTemplate
  });

  equal(tagNameFor(this), 'lio-multi-select', "component has 'lio-multi-select' tag");
});

test("options cannot have duplicate values", function() {
  var context = this;

  this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=1}}
    */})
  });

  throws(function() {
    context.$();
  }, /Options in 'lio-multi-select' components cannot contain duplicate values./);
});

test("the 'values' attribute cannot contain duplicates", function() {
  var component = this.subject({
    layout: defaultTemplate
  });

  this.$();

  throws(function() {
    component.set('values', [ 1, 1 ]);
  }, /The 'value' attribute of 'lio-multi-select' components must not contain duplicate values./);
});

test("options with values contained in the 'values' attribute initially are set to selected", function() {
  var component = this.subject({
    layout: defaultTemplate,
    values: [ 1, 3 ]
  });

  ok(this.$().find('lio-option:nth-of-type(1)').hasClass('selected'), "first option has 'selected' class");
  ok(!this.$().find('lio-option:nth-of-type(2)').hasClass('selected'), "second option does not have 'selected' class");
  ok(this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option has 'selected' class");
});

test("the 'values' attribute is initialized with options that are selected if it is falsy", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1 selected=true}}
      {{lio-option value=2}}
      {{lio-option value=3 selected=true}}
    */}),
    values: null
  });

  this.$();

  deepEqual(component.get('values'), [ 1, 3 ]);
});

test("adding an element to the 'value' attribute sets the corresponding option to selected", function() {
  var component = this.subject({
    layout: defaultTemplate,
    values: [ 1 ]
  });

  ok(!this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option does not have 'selected' class");
  Ember.run(function() {
    component.get('values').pushObject(3);
  });
  ok(this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option has 'selected' class");
});

test("selecting an option adds its value to the 'values' attribute", function() {
  var component = this.subject({
    layout: defaultTemplate,
    values: [ 1 ]
  });

  this.$();

  var lastOption = component.componentsForType('option').get('lastObject');

  ok(!this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option does not have 'selected' class");
  Ember.run(lastOption, 'set', 'selected', true);
  ok(this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option has 'selected' class");
});

test("the property bound to the `value` attribute is replaced when the selection changes", function() {
  var contextObject = Ember.Object.create({
    value: []
  });

  var component = this.subject({
    layout: defaultTemplate,
    contextObject: contextObject,
    valuesBinding: 'contextObject.values'
  });

  this.$();

  var lastOption = component.componentsForType('option').get('lastObject');
  var values = contextObject.get('values');

  Ember.run(lastOption, 'set', 'selected', true);
  notStrictEqual(values, contextObject.get('values'), "property bound to 'values' was replaced");
});

test("clicking an option toggles its selected state", function() {
  var component = this.subject({
    layout: defaultTemplate
  });

  this.$();

  var lastOption = component.componentsForType('option').get('lastObject');

  ok(!lastOption.get('selected'));
  this.$().find('lio-option:nth-of-type(3)').simulate('click');
  ok(lastOption.get('selected'));
  this.$().find('lio-option:nth-of-type(3)').simulate('click');
  ok(!lastOption.get('selected'));
});

test("clicking an option when the component is disabled has no effect", function() {
  var component = this.subject({
    layout: defaultTemplate,
    disabled: true,
    values: []
  });

  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  deepEqual(component.get('values'), [], "`values` attribute did not change");
});

test("all options are disabled when the component is disabled", function() {
  var component = this.subject({
    layout: defaultTemplate,
    disabled: true,
    values: []
  });

  ok(this.$().find('lio-option:nth-of-type(1)').hasClass('disabled'), "first option has 'disabled' class");
  ok(this.$().find('lio-option:nth-of-type(2)').hasClass('disabled'), "second option has 'disabled' class");
  ok(this.$().find('lio-option:nth-of-type(3)').hasClass('disabled'), "third option has 'disabled' class");
});

test("clicking an option triggers the component's default action", function() {
  expect(2);

  var contextObject = Ember.Object.create({
    values: []
  });

  var targetObject = {
    action: function(values) {
      deepEqual(values, [ 1 ], "default action was triggered with the new values");
      deepEqual(contextObject.get('values'), [ 1 ], "the values changed in their own run loop");
    }
  };

  var component = this.subject({
    layout: defaultTemplate,
    contextObject: contextObject,
    valuesBinding: 'contextObject.values',
    action: 'action',
    targetObject: targetObject
  });

  this.$().find('lio-option:nth-of-type(1)').simulate('click');
});

test("clicking the 'select-all' button selects all options", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-button action="select-all"}}
    */}),
    values: [ 1 ]
  });

  this.$().find('lio-button[action="select-all"]').simulate('click');
  ok(this.$().find('lio-option:nth-of-type(1)').hasClass('selected'), "first option has 'selected' class");
  ok(this.$().find('lio-option:nth-of-type(2)').hasClass('selected'), "second option has 'selected' class");
  ok(this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option has 'selected' class");
});

test("the 'select-all' button is disabled when all options are selected", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-button action="select-all"}}
    */}),
    values: [ 1, 2, 3 ]
  });

  ok(this.$().find('lio-button[action="select-all"]').hasClass('disabled'), "'select all' button has 'disabled' class");
  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  ok(!this.$().find('lio-button[action="select-all"]').hasClass('disabled'), "'select all' button does not have 'disabled' class");
  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  ok(this.$().find('lio-button[action="select-all"]').hasClass('disabled'), "'select all' button has 'disabled' class");
});

test("clicking the 'select-all' button has no effect when the component is disabled", function() {
  var component = this.subject({
    layout: defaultTemplate,
    disabled: true,
    values: []
  });

  this.$().find('lio-button[action="select-all"]').simulate('click');
  deepEqual(component.get('values'), [], "`values` attribute did not change");
});

test("clicking the 'select-all' button triggers the component's default action", function() {
  expect(2);

  var contextObject = Ember.Object.create({
    values: []
  });

  var targetObject = {
    action: function(values) {
      deepEqual(values, [ 1, 2, 3 ], "default action was triggered with the new values");
      deepEqual(contextObject.get('values'), [ 1, 2, 3 ], "the values changed in their own run loop");
    }
  };

  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-button action="select-all"}}
    */}),
    contextObject: contextObject,
    valuesBinding: 'contextObject.values',
    action: 'action',
    targetObject: targetObject
  });

  this.$().find('lio-button[action="select-all"]').simulate('click');
});

test("clicking the 'unselect-all' button unselects all options", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-button action="unselect-all"}}
    */}),
    values: [ 1, 3 ]
  });

  this.$().find('lio-button[action="unselect-all"]').simulate('click');
  ok(!this.$().find('lio-option:nth-of-type(1)').hasClass('selected'), "first option does not have 'selected' class");
  ok(!this.$().find('lio-option:nth-of-type(2)').hasClass('selected'), "second option does not have 'selected' class");
  ok(!this.$().find('lio-option:nth-of-type(3)').hasClass('selected'), "third option does not have 'selected' class");
});

test("the 'unselect-all' button is disabled when no options are selected", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-button action="unselect-all"}}
    */}),
    values: []
  });

  ok(this.$().find('lio-button[action="unselect-all"]').hasClass('disabled'), "'unselect all' button has 'disabled' class");
  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  ok(!this.$().find('lio-button[action="unselect-all"]').hasClass('disabled'), "'unselect all' button does not have 'disabled' class");
  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  ok(this.$().find('lio-button[action="unselect-all"]').hasClass('disabled'), "'unselect all' button has 'disabled' class");
});

test("clicking the 'unselect-all' button has no effect when the component is disabled", function() {
  var component = this.subject({
    layout: defaultTemplate,
    disabled: true,
    values: [ 1, 3 ]
  });

  this.$().find('lio-button[action="select-all"]').simulate('click');
  deepEqual(component.get('values'), [ 1, 3 ], "`values` attribute did not change");
});

test("clicking the 'unselect-all' button triggers the component's default action", function() {
  expect(2);

  var contextObject = Ember.Object.create({
    values: [ 1, 3 ]
  });

  var targetObject = {
    action: function(values) {
      deepEqual(values, [], "default action was triggered with the new values");
      deepEqual(contextObject.get('values'), [], "the values changed in their own run loop");
    }
  };

  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-button action="unselect-all"}}
    */}),
    contextObject: contextObject,
    valuesBinding: 'contextObject.values',
    action: 'action',
    targetObject: targetObject
  });

  this.$().find('lio-button[action="unselect-all"]').simulate('click');
});

test("clicking an option with the 'unselect' attribute unselects the option with the corresponding value", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{lio-option value=1}}
      {{lio-option value=2}}
      {{lio-option value=3}}

      {{lio-option unselect=true value=1}}
    */}),
    values: [ 1 ]
  });

  ok(this.$().find('lio-option:nth-of-type(4)').hasClass('unselect'), "unselect option has 'unselect' class");
  this.$().find('lio-option.unselect').simulate('click');
  ok(!this.$().find('lio-option:nth-of-type(1)').hasClass('selected'), "first option does not have 'selected' class");
});

test("the filter component must contain a text field", function() {
  var context = this;

  this.subject({
    layout: compileTemplate(function() {/*
      {{#lio-filter}}
        {{lio-button action="clear"}}
      {{/lio-filter}}
    */})
  });

  throws(function() {
    context.render();
  }, /The 'lio-filter' component must contain a single 'lio-text-field' component./);
});

test("entering a filter value filters the list of options", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{#lio-option value=1}}One{{/lio-option}}
      {{#lio-option value=2}}Two{{/lio-option}}
      {{#lio-option value=3}}Three{{/lio-option}}

      {{#lio-filter debounce=false}}
        {{lio-text-field}}
      {{/lio-filter}}
    */}),
  });

  ok(!this.$().find('lio-option:nth-of-type(1)').hasClass('filtered'), "first option does not have 'filtered' class");
  this.$().find('lio-filter input').val('t').change();
  ok(this.$().find('lio-option:nth-of-type(1)').hasClass('filtered'), "first option has 'filtered' class");
});

test("clicking the 'clear' button removes filtered state from options", function() {
  var component = this.subject({
    layout: compileTemplate(function() {/*
      {{#lio-option value=1}}One{{/lio-option}}
      {{#lio-option value=2}}Two{{/lio-option}}
      {{#lio-option value=3}}Three{{/lio-option}}

      {{#lio-filter debounce=false}}
        {{lio-text-field}}
        {{lio-button action="clear"}}
      {{/lio-filter}}
    */}),
  });

  this.$().find('lio-filter input').val('t').change();
  ok(this.$().find('lio-option:nth-of-type(1)').hasClass('filtered'), "first option has 'filtered' class");
  this.$().find('lio-button[action="clear"]').simulate('click');
  equal(this.$().find('lio-filter input').val(), '', "filter value is empty");
  ok(!this.$().find('lio-option:nth-of-type(1)').hasClass('filtered'), "first option does not have 'filtered' class");
});

test("an option's value is looked up using the option's 'valuePath' attribute", function() {
  var component = this.subject({
    values: [],
    options: Ember.A([
      { value: 1 },
      { value: 2 },
      { value: 3 }
    ]),
    layout: compileTemplate(function() {/*
      {{#each option in options}}
        {{lio-option option=option valuePath="value"}}
      {{/each}}
    */}),
  });

  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  this.$().find('lio-option:nth-of-type(2)').simulate('click');
  deepEqual(component.get('values'), [ 1, 2 ]);
});

test("an option's value is looked up using the 'optionValuePath' attribute", function() {
  var component = this.subject({
    values: [],
    optionValuePath: 'value',
    options: Ember.A([
      { value: 1 },
      { value: 2 },
      { value: 3 }
    ]),
    layout: compileTemplate(function() {/*
      {{#each option in options}}
        {{lio-option option=option}}
      {{/each}}
    */}),
  });

  this.$().find('lio-option:nth-of-type(1)').simulate('click');
  this.$().find('lio-option:nth-of-type(2)').simulate('click');
  deepEqual(component.get('values'), [ 1, 2 ]);
});
