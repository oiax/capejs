(function(global) {
  var ClickCounter = Cape.createComponentClass({
    render: function() {
      return this.markup(function(m) {
        m.div(String(this.counter), {
          class: 'counter',
          onclick: function(e) { this.increment() }
        })
      })
    },

    init: function() {
      this.counter = 0;
      this.refresh();
    },

    increment: function() {
      this.counter++;
      this.refresh();
    }
  });

  if ("process" in global) module.exports = ClickCounter;
  global.ClickCounter = ClickCounter;
})((this || 0).self || global);