import Ember from "ember";
import {
  test,
  moduleForComponent
} from 'ember-qunit';
import compileTemplate from '../../helpers/compile-template';
import tagNameFor from '../../helpers/tag-name-for';

moduleForComponent('lio-tip', 'TipComponent', {
  needs: [
    'component:lio-label',
    'component:lio-popover'
  ],
  teardown: function() {
    // This happens in the willDestroyElement hook of the tip component, but
    // ember-qunit, being the leading the ember test adapter, doesn't yet
    // destroy views on teardown
    //
    // Look for that in ember-qunit v0.2.0! Yay?
    $(window).off('click.lio');
  }
});

test("component has correct tag name", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  equal(tagNameFor(this), 'lio-tip', "component has 'lio-tip' tag");
});

test("component is active when the label is clicked", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  ok(!component.get('active'), "component is inactive by default");
  this.$().find('lio-label').simulate('click');
  ok(component.get('active'), "component is active when the label is clicked");
});

test("component is active when the label is hovered and the activator is set to hover", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    activator: 'hover'
  });

  ok(!component.get('active'), "component is inactive by default");
  this.$().find('lio-label').trigger('mouseenter');
  ok(component.get('active'), "component is active when the label is 'mouse entered'");
  this.$().find('lio-label').trigger('mouseleave');
  ok(!component.get('active'), "component is no longer active once the label has 'mouse left'");
});

test("component has the active class when it is active", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    active: true
  });

  ok(this.$().hasClass('active'), "the active class is present when active is true");
});

test("it is active when focused", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    active: false
  });

  this.$().find('lio-label').focusin();
  ok(component.get('active'));
});

test("it is not active when blurred", function() {
  var context = this;
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    active: true
  });

  Ember.run(function() {
    context.$().parent().simulate('click');
    ok(!component.get('active'));
  });
});

test("the popover is open when active", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    active: true
  });

  this.$();

  ok(component.get('popover').$().is(':visible'));
});

test("the component throws if there isn't a popover", function() {
  var context = this;

  this.subject({
    layout: compileTemplate(function() {/*
      {{lio-label}}
    */})
  });

  throws(function() {
    context.render();
  }, /The 'lio-tip' component must have a single 'lio-label' and a single 'lio-popover'/);
});

test("the component throws if there is more than one popover", function() {
  var context = this;

  this.subject({
    layout: compileTemplate(function() {/*
      {{lio-label}}
      {{lio-popover}}
      {{lio-popover}}
    */})
  });

  throws(function() {
    context.render();
  }, /The 'lio-tip' component must have a single 'lio-label' and a single 'lio-popover'/);
});

test("the component throws if there isn't a label", function() {
  var context = this;

  this.subject({
    layout: compileTemplate(function() {/*
      {{lio-popover}}
    */})
  });

  throws(function() {
    context.render();
  }, /The 'lio-tip' component must have a single 'lio-label' and a single 'lio-popover'/);
});

test("the component throws if there is more than one label", function() {
  var context = this;

  this.subject({
    layout: compileTemplate(function() {/*
      {{lio-popover}}
    */})
  });

  throws(function() {
    context.render();
  }, /The 'lio-tip' component must have a single 'lio-label' and a single 'lio-popover'/);
});

function defaultTemplate() {/*
  {{#lio-label}}The label for the tip{{/lio-label}}
  {{#lio-popover}}The popover for the tip{{/lio-popover}}
*/}
