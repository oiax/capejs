---
title: "Data Stores"
---

<a class="anchor" id="basics"></a>
### Basics

When you develop something larger than a tiny widget, you are recommended to
create a *data store* for your Cape.JS component.

The following example illustrates the basic concept of data stores.

#### index.html

```html
<div id="todo-list"></div>

<script src="./todo_item_store.js"></script>
<script src="./todo_list2.js"></script>
<script>
  var todoList = new TodoList2();
  todoList.mount('todo-list');
</script>
```

#### todo_item_store.js

```javascript
var TodoItemStore = Cape.createDataStoreClass({
  init: function() {
    this.items = [
      { title: 'Foo', done: false },
      { title: 'Bar', done: true }
    ];
    this.propagate();
  },
  addItem: function(title) {
    this.items.push({ title: title, done: false });
    this.propagate();
  },
  toggle: function(item) {
    item.done = !item.done;
    this.propagate();
  }
});
```

The `TodoItemStore` class has three methods and each of them ends with
`this.propagate()`, which calls the `refresh` method of all attached components.

#### todo_list2.js

```javascript
var TodoList2 = Cape.createComponentClass({
  render: function(m) {
    m.ul(function(m) {
      this.ds.items.forEach(function(item) {
        this.renderItem(m, item);
      }.bind(this))
    });
    this.renderForm(m);
  },

  renderItem: function(m, item) {
    m.li(function(m) {
      m.label({ class: { completed: item.done }}, function(m) {
        m.input({ type: 'checkbox', checked: item.done,
          onclick: function(e) { this.ds.toggle(item) } });
        m.space().text(item.title);
      })
    })
  },

  renderForm: function(m) {
    m.form(function(m) {
      m.textField('title', { onkeyup: function(e) { this.refresh() } });
      m.button("Add", {
        disabled: this.val('title') === '',
        onclick: function(e) { this.ds.addItem(this.val('title', '')) }
      });
    });
  },

  init: function() {
    this.ds = TodoItemStore.create();
    this.ds.attach(this);
    this.ds.init();
  },

  beforeUnmount: function() {
    this.ds.detach(this);
  }
});
```

Within the `init` method, we create a singleton instance of `TodoItemStore` class *(data store)*,
and set it to the `ds` property of this component.

Then we call the `attach` method of the data store to register this component
as a *listener* to the *change event*. When the content of data store is changed,
a *change event* is emitted to this component.

When we click a check box, the following code is executed:

```javascript
this.ds.toggle(item)
```

This inverts the `done` attribute of this item and calls `this.propagate()`,
which will cause the re-rendering of this component.

A working demo is found in the directory [https://github.com/oiax/capejs/demo/todo_list2](https://github.com/oiax/capejs/demo/todo_list2).