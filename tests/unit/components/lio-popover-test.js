import Ember from "ember";
import {
  test,
  moduleForComponent
} from 'ember-qunit';
import compileTemplate from '../../helpers/compile-template';
import tagNameFor from '../../helpers/tag-name-for';
import {
  mockGlobalPath
} from '../../helpers/mock-path';

moduleForComponent('lio-popover', 'PopoverComponent');

test("component has correct tag name", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  equal(tagNameFor(this), 'lio-popover', "component has 'lio-popover' tag");
});

test("position must be one of a limited set of values", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    equal(component.get('position'), 'top', "The default position is 'top'");

    component.set('position', 'right');
    equal(component.get('position'), 'right', "The position can be set");

    throws(function() {
      component.set('position', 'nope');
    }, "The position cannot be set to something not in the positions array");

    equal(component.get('position'), 'right');
  });
});

test("the rendered position is different than position when the tooltip needs to flip", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  this.$();

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    component.send('activate');
    giveBounds(component);
    component.adjustPosition();
    equal(component.get('position'), 'top');
    equal(component.get('renderedPosition'), 'bottom');
  });
});

test("it has the 'active' class when active", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    active: true
  });

  $('<div id="anchor">').appendTo('#ember-testing');
  ok(this.$().hasClass('active'));
  ok(!this.$().hasClass('inactive'));
});

test("it has the 'inactive' class when inactive", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    active: false
  });

  $('<div id="anchor">').appendTo('#ember-testing');
  ok(this.$().hasClass('inactive'));
  ok(!this.$().hasClass('active'));
});

test("className is based off the rendered position", function() {
  var context = this;
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  this.$();

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    component.send('activate');
    component.set('position', 'left');
    giveBounds(component);
    component.adjustPosition();
    equal(component.get('renderedPosition'), 'right');
    Ember.run.next(function() {
      ok(context.$().hasClass('right'));
      ok(!context.$().hasClass('left'));
    });
  });
});

test("corner positions result in two position class names (matching the edges)", function() {
  var context = this;
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  this.$();

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    component.send('activate');
    component.set('position', 'top-left');
    giveBounds(component);
    component.adjustPosition();
    equal(component.get('renderedPosition'), 'top-left');
    Ember.run.next(this, function() {
      ok(context.$().hasClass('left'));
      ok(context.$().hasClass('top'));
    });
  });
});

test("the arrow position is centered on the popover", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate)
  });

  this.$();

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    component.send('activate');

    giveBounds(component, {
      offsetTop: 500,
      offsetLeft: 500,
      trueOffsetTop: 500,
      trueOffsetLeft: 500
    });
    component.adjustPosition();
    component.positioners[component.get('renderedPosition')](component);

    deepEqual(component.get('arrowOffset'), {
      top: 50,
      left: 45
    }, "the arrow is positioned correctly when the anchor is centered and the position is top");

    giveBounds(component);
    component.adjustPosition();
    component.positioners[component.get('renderedPosition')](component);

    deepEqual(component.get('arrowOffset'), {
      top: -10,
      left: 45
    }, "the arrow is positioned correctly when the anchor is in the top left and the position is top");

    giveBounds(component, {
      offsetLeft: 700
    });
    component.adjustPosition();
    component.positioners[component.get('renderedPosition')](component);

    deepEqual(component.get('arrowOffset'), {
      top: -10,
      left: 45
    }, "the arrow is positioned correctly when the anchor is in the top right and the position is top");

    component.set('position', 'left');

    giveBounds(component, {
      offsetTop: 500,
      offsetLeft: 500,
      trueOffsetTop: 500,
      trueOffsetLeft: 500
    });
    component.adjustPosition();
    component.positioners[component.get('renderedPosition')](component);

    deepEqual(component.get('arrowOffset'), {
      top: 20,
      left: 100
    }, "the arrow is positioned correctly when the anchor is in the center and the position is left");

    giveBounds(component);
    component.adjustPosition();
    component.positioners[component.get('renderedPosition')](component);

    deepEqual(component.get('arrowOffset'), {
      top: 20,
      left: -10
    }, "the arrow is positioned correctly when the anchor is in the top left and the position is left");

    giveBounds(component, {
      offsetTop: 800,
      offsetLeft: 500,
      trueOffsetTop: 800,
      trueOffsetLeft: 500
    });
    component.adjustPosition();
    component.positioners[component.get('renderedPosition')](component);

    deepEqual(component.get('arrowOffset'), {
      top: 20,
      left: 100
    }, "the arrow is positioned correctly when the anchor is in the bottom left and the position is left");
  });
});

test("the tooltip is repositioned when the window resizes", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
  });

  this.$();

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    component.send('activate');
    giveBounds(component, {
      offsetTop: 1337,
      trueOffsetTop: 1337
    });

    component.adjustPosition();
    equal(component.get('offsetTop'), 1337);

    $(window).trigger('resize');
    notEqual(component.get('offsetTop'), 1337);
  });
});

test("the tooltip does not flip when the offset to the parent is too small but the true offset is not too small", function() {
  var component = this.subject({
    layout: compileTemplate(defaultTemplate),
    position: 'top'
  });

  this.$();

  $('<div id="anchor">').appendTo('#ember-testing');
  component.set('anchor', '#anchor');

  Ember.run(function() {
    component.send('activate');
    giveBounds(component, {
      offsetTop: 5,
      trueOffsetTop: 500
    });

    component.adjustPosition();
    equal(component.get('position'), 'top');
    equal(component.get('renderedPosition'), 'top');
  });
});

function defaultTemplate() {/*
  This is the contents of the popover
*/}

function giveBounds(component, overrides) {
  component.setProperties(Ember.merge({
    offsetTop: 10,
    offsetLeft: 10,

    trueOffsetTop: 10,
    trueOffsetLeft: 10,

    windowWidth: 1000,
    windowHeight: 1000,

    width: 100,
    height: 50,

    anchorWidth: 300,
    anchorHeight: 30,

    arrowWidth: 10,
    arrowHeight: 10,

    arrowOffsetTop: 50 / 2 - 10 / 2,
    arrowOffsetLeft: 100 / 2 - 10 / 2
  }, overrides));
}

test("transition classes are added when activating the popover", function() {
  mockGlobalPath('$.support.transition', { end: 'testEvent' }, this, function() {
    var component = this.subject({
      layout: compileTemplate(defaultTemplate)
    });

    this.$();

    $('<div id="anchor">').appendTo('#ember-testing');
    component.set('anchor', '#anchor');

    Ember.run(component, 'set', 'active', true);
    ok(this.$().hasClass('activating'), "it has the 'activating' class");
    ok(!this.$().hasClass('active'), "it does not have the 'active' class");
    Ember.run(component, 'trigger', 'transitionDidEnd');
    ok(!this.$().hasClass('activating'), "it does not have the 'activating' class");
    ok(this.$().hasClass('active'), "it has the 'active' class");
    Ember.run(component, 'set', 'active', false);
    ok(this.$().hasClass('deactivating'), "it has the 'deactivating' class");
    ok(this.$().hasClass('active'), "it has the 'active' class");
    Ember.run(component, 'trigger', 'transitionDidEnd');
    ok(!this.$().hasClass('deactivating'), "it does not have the 'deactivating' class");
    ok(!this.$().hasClass('active'), "it does not have the 'active' class");
  });
});
