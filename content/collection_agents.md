---
title: "Collection Agents"
---

<span class="badge alert-info">1.2</span>

[Basics](#basics) -
[Agent Adapters](#agent-adapters) -
[Defining Classes](#defining-classes) -
[Initialization](#initialization) -
[Creating Resources](#creating-resources) -
[REST Operations](#rest-operations) -
[Callbacks and Error Handlers](#callbacks-and-error-handlers) -
[Changing the Path Prefix](#changing-path-prefix) -
[Cooperation with a Data Store](#cooperation-with-a-data-store)

<a class="anchor" id="basics"></a>
### Basics

The _collection agents_ are JavaScript objects that have following capabilities:

* Keeping an array of objects that represent a _resource collection_ of the server.
* Creating, updating and deleting the members of this collection by sending Ajax requests to the server.

Cape.JS provides similar objects called _data stores_.
But, they lack _built-in_ Ajax functionalities so that
you have to implement them on your own.

On the other hand, data stores work as the _subjects_, or _observables_, in
the terms of [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern)
while collection agents do not.

However, you can combine a collection agent with a data store in order to notify
its stage changes to the observers as explained [later](#cooperation-with-a-data-store).

Note that the collection agents are introduced with the Cape.JS version 1.2.


<a class="anchor" id="agent-adapters"></a>
### Agent Adapters

Sometimes, the Ajax clients need to send a set of specific HTTP headers to the server.
A Rails application requires a correct `X-CSRF-Token` header, for example.

In order to cope with the peculiarities of the server, you can use a _agent adapter_.
As of `v1.2.0`, the only built-in adapter is `Cape.AgentAdapters.RailsAdapter`.

If your server is built on the Ruby on Rails, put the following line at the very
beginning of your JavaScript code:

```javascript
Cape.defaultAgentAdapter = 'rails'
```

<a class="anchor" id="defining-classes"></a>
### Defining Classes

In order to use collection agents, you should define a class inheriting the
`Cape.CollectionAgent` class.

You can define such a class calling `Cape.createCollectionAgentClass()` method:

```javascript
var UserCollectionAgent = Cape.createCollectionAgentClass({
  constructor: function(client, options) {
    this.resourceName = 'users';
  }
})
```

You can also define it using the ES6 syntax:

```javascript
class UserCollectionAgent extends Cape.CollectionAgent {
  constructor(client, options) {
    super(client, options);
    this.resourceName = 'users';
  }
}
```

The collection agent uses the `resourceName` property to construct the URL paths
as explained below.

<a class="anchor" id="initialization"></a>
### Initialization

Suppose that when you send an HTTP request `GET /users` to the server,
it returns the following JSON string:

```json
"users" : [
  { "id": 1, "name": "John" },
  { "id": 2, "name": "Anna" },
  { "id": 3, "name": "Tommy" }
]
```

Then, you can build a Cape.JS component like this:

```javascript
class UserList extends Cape.Component {
  init() {
    this.agent = new UserCollectionAgent(this);
    this.agent.refresh();
  }

  render(m) {
    m.ul(m => {
      this.agent.objects.forEach(user => {
        m.li(user.name);
      });
    });
  }
}
```

Note that the `UserCollectionAgent.getInstance()` method is a singleton factory method,
which returns the same object always.

The `attach` method register the argument as an _event listener_ of the agent.
With this the component will get notified
when the _objects_ managed by the agent are changed.

The `refresh` method will trigger an Ajax request to the server and
initialize the `objects` property of the component.

In response to the notification from the agent,
the component will render the following HTML fragment:

```html
<ul>
  <li>John</li>
  <li>Anna</li>
  <li>Tommy</li>
</ul>
```

<a class="anchor" id="creating-resources"></a>
### Creating Resources

Suppose that you can create a _user_ by sending a `POST` request to the `/users`
with the following body:

```json
"user": { "name": "Nancy" }
```

Then, you can create a form for adding users like this:

```javascript
class UserList extends Cape.Component {
  init() {
    this.agent = new UserCollectionAgent(this);
    this.agent.refresh();
  }

  render(m) {
    m.ul(m => {
      this.agent.objects.forEach(user => {
        m.li(user.name);
      });
    });
    m.formFor('user', m => {
      m.textField('name');
      m.onclick(e => this.agent.create(this.paramsFor('user')));
      m.btn('Create');
    });
  }
}
```

<a class="anchor" id="rest-operations"></a>
### REST operations

Cape.JS provides four basic methods for REST operations:

* [#index()](./api/collection_agent#index) to get a collection of resources
* [#create()](./api/collection_agent#create) to create a resource
* [#update()](./api/collection_agent#update) to update (modify) a resource
* [#destroy()](./api/collection_agent#destroy) to delete a resource

These methods send an Ajax call using Rails like HTTP verbs and paths.
If the resource name is `'users'`, the HTTP verbs and paths will be as shown in the
following table, where `:id` is an integer denoting the value of object's `id`.

|Method|HTTP Verb|Path|
|------|---------|----|
|#index()|GET|/users|
|#create()|POST|/users|
|#update()|PATCH|/users/:id|
|#destroy()|DELETE|/users/:id|

The following is an example of code which modify the name of a user:

```javascript
this.agent.update(1, { name: 'johnny' });
```

When you specify other combinations of HTTP verb and path, you should use
one of following five methods:

* [#get()](./api/collection_agent#get) to send a `GET` request
* [#head()](./api/collection_agent#head) to send a `HEAD` request
* [#post()](./api/collection_agent#post) to send a `POST` request
* [#patch()](./api/collection_agent#patch) to send a `PATCH` request
* [#put()](./api/collection_agent#put) to send a `PUT` request
* [#delete()](./api/collection_agent#delete) to send a `DELETE` request

For example, if you want to make a `PATCH` request to the path `/users/123/move_up`,
write a code like this:

```javascript
this.agent.patch('move_up', 123, {});
```

<a class="anchor" id="callbacks-and-error-handlers"></a>
### Callbacks and Error Handlers

If you want the collection agent to perform any jobs after the Ajax request,
you can pass a _callback_ as the last argument to the methods:

```javascript
m.onclick(e => this.agent.create(this.paramsFor('user'), data => {
  if (data.result === 'OK') {
    this.val('user.name', '');
  }
  else {
    // Do something to handle validation errors, for example.
  }
}));
```

Furthermore, you can specify an _error handler_ after the callback:

```javascript
m.onclick(e => this.agent.create(this.paramsFor('user'), data => {
  if (data.result === 'OK') {
    this.val('user.name', '');
  }
  else {
    // Do something to handle validation errors, for example.
  }
}, ex => {
  // Do some error handling.
}));
```

This error hander is called when an exception is raised due to some reasons
(network errors, syntax errors, etc.).

<a class="anchor" id="changing-path-prefix"></a>
### Changing the Path Prefix

If the paths of the server-side API has a prefix, you should set the `basePath`
and `nestdIn` properties.

The value of `basePath` property is prepended to the resource name
when the collection agent constructs the API paths. Its default value is `/`.
The values of `nestedIn` property is inserted between the base path and
the resource name. Its default value is ''.

Suppose that you defined the `ArticleCollectionAgent` class like this:

```javascript
class ArticleCollectionAgent extends Cape.CollectionAgent {
  constructor(options) {
    super(options);
    this.resourceName = 'articles';
    this.basePath = '/api/v2/';
  }
}
```

And, you instantiated it as follows:

```javascript
class ArticleList extends Cape.Component {
  init() {
    this.agent = new ArticleCollectionAgent(this, { nestedIn: 'members/123/' });
    this.agent.refresh();
  }

  render(m) {
    // ...
  }
}
```

Then, `this.agent` will construct paths like these:

* `/api/v2/members/123/articles`
* `/api/v2/members/123/articles/99`

Note that you should _not_ define the `init()` method like this:

```javascript
  init() {
    this.agent = new ArticleCollectionAgent(this);
    this.agent.nestedIn = 'members/123/';
    this.agent.refresh();
  }
}
```

Superficially it may work well, but problems will occur when multiple components
attach themselves to this agent.

The `CollectionAgent` class keeps a map of named instances of
`CollectionAgent` as key-value pairs in order to ensure a single instance
per key, which is constructed using the `resourceName`, `basePath` and `nestedIn`
options.

See [Multiton pattern](https://en.wikipedia.org/wiki/Multiton_pattern)
<i class="fa fa-external-link"></i> on _Wikipedia_
for the technical background.

<a class="anchor" id="cooperation-with-a-data-store"></a>
### Cooperation with a Data Store

```javascript
class TaskStore extends Cape.DataStore {
  constructor(agent) {
    super();
    this.agent = agent;
    this.tasks = agent.tasks;
  }
}
```

```javascript
class TaskCollectionAgent extends Cape.CollectionAgent {
  constructor(client, dataStore, options) {
    super(client, options);
    this.dataStore = dataStore;
    this.resourceName = 'tasks';
  }

  afterRefresh() {
    // this.client.refresh();
    this.dataStore.propagate();
  }
}
```

```javascript
class TaskList1 extends Cape.Component {
  init() {
    this.ds = new TaskStore();
    this.ds.attach(this);
  }

  render(m) { ... }
}
```

```javascript
class TaskList2 extends Cape.Component {
  init() {
    this.ds = new TaskStore();
    this.ds.attach(this);
    this.agent = new TaskCollectionAgent(this, this.ds);
    this.refresh();
  }

  render(m) { ... }
}
```