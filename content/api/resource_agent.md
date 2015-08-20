---
title: "Cape.ResourceAgent - API Reference"
---

<span class="badge alert-info">1.2</span>

[Constructor](#constructor) -
[#_](#_) -
[#adapter](#adapter) -
[#ajax()](#ajax) -
[#basePath](#base-path) -
[#client](#client) -
[#collectionPath()](#collection-path) -
[#create()](#create) -
[#data](#data) -
[#dataType](#data-type) -
[.defaultAgentAdapter](#default-agent-adapter) -
[#defaultErrorHandler()](#default-error-hander) -
[#destroy()](#destroy) -
[#errors](#errors) -
[#formName](#formName) -
[#headers](#headers) -
[#init()](#init) -
[#memberPath()](#member-path) -
[#object](#object) -
[#newPath()](#new-path) -
[#nestedIn](#nested-in) -
[#paramName](#param-name) -
[#resourceName](#resource-name) -
[#singular](#singular) -
[#singularPath()](#singular-path) -
[#update()](#update)

<a class="anchor" id="constructor"></a>
### Constructor

The `Cape.ResourceAgent` constructor takes
a `Cape.Component` object and an optional object (options) as arguments.

#### Options

* **resourceName:** the name of resource.
* **basePath:** the string that is added to the request path. Default value is '/'.
* **nestedIn:** the string that is inserted between path prefix and the resource
  name. Default value is ''.
* **adapter:** the name of adapter (e.g., `'rails'`). Default is `undefined`.
  Default value can be changed by setting `Cape.defaultAgentAdapter` property.
* **dataType:** the type of data that you're expecting from the server.
  The value must be `'json'` (default) or `'text'`.
* **pathPrefix:** the string that is added to the request path.
  Default value is `'/'`.
* **singular:** a boolean value that specifies if the resource is singular or not.
  Resources are called _singular_ when they have a URL without ID. Default is `false`.
* **formName:** the name of form with which the users edit the properties
  of the resource. Default is `undefiend`.
  When the `formName` option is not defined, the name is derived from the
  `resourceName` property, e.g. `user` if the resource name is `user`.
* **paramName:** the name of parameter to be used when the `object`
  property is initialized and the request parameter is constructed.
  Default is undefiend.
  When the `pathName` option is not defined, the name is derived from the
  `resourceName` property, e.g. `user` if the resource name is `user`.

#### Adapters

Currently, Cape.JS provides only `RailsAdapter`, which sets the `X-CSRF-Token` header
for Ajax requests.

#### Example

```javascript
Cape.defaultAgentAdapter = 'rails';

var Form = Cape.createComponentClass({
  init: function() {
    this.id = 123;
    this.agent = new Cape.ResourceAgent(this, { resourceName: 'user' });
    this.agent.init();
  },

  render: function(m) {
    m.formFor('user', function(m) {
      m.textField('login_name');
      m.onclick(e => this.agent.update()).btn('Update');
    });
  }
});
```

Usually, You will want to define a class inheriting `Cape.ResourceAgent`:

```javascript
Cape.defaultAgentAdapter = 'rails';

var UserAgent = Cape.createResourceAgentClass({
  constructor: function(client, options) {
    super(client, options);
    this.resourceName = 'user';
  }
})

var Form = Cape.createComponentClass({
  init: function() {
    this.id = 123;
    this.agent = new UserAgent(this);
    this.agent.init();
  },

  render: function(m) {
    m.formFor('user', function(m) {
      m.textField('login_name');
      m.onclick(e => this.agent.update()).btn('Update');
    });
  }
});
```

<a class="anchor" id="_"></a>
### #_

This property holds the agent's _inner object,_ which keeps _private_ properties
and methods. Developers should not tamper with it.


<a class="anchor" id="adapter"></a>
### #adapter

This property holds the name of adapter (e.g., 'rails'). Default is undefined.
Default value can be changed by setting `Cape.defaultAgentAdapter` property.


<a class="anchor" id="ajax"></a>
### #ajax()

#### Usage

* **attr(httpMethod, path)**
* **attr(httpMethod, path, callback)**
* **attr(httpMethod, path, callback, errorHandler)**

Send an Ajax request to the server.


#### Example

```javascript
Cape.defaultAgentAdapter = 'rails';

var Page = Cape.createComponentClass({
  init: function() {
    this.agent = new Cape.ResourceAgent(this);
    this.refresh();
  },

  render: function(m) {
    m.onclick(e => {
      this.agent.ajax('POST', '/counter', function(data) {
        alert(data);
      })
    });
    m.btn('Click');
  }
});
```

<a class="anchor" id="base-path"></a>
### #basePath

This property holds the string that is added to the request path.
Default value is `'/'`.

<a class="anchor" id="client"></a>
### #client

This property holds an instance of `Cape.Component` class, which has been
passed as the first argument of constructor.


<a class="anchor" id="collection-path"></a>
### #collectionPath()

Returns the URL path to a collection of resources in accordance with the
values of `resourceName`, `basePath` and `nestedIn` properties:

|#resourceName|#basePath|#nestedIn|#collectionPath()|
|------------|--------|--------|----|
|users|||/users|
|users|/api/||/api/users|
|users||teams/123/|/teams/123/users|
|users|/api/|teams/123/|/api/teams/123/users|

Note that the default value of `basePath` property is `/`.


<a class="anchor" id="member-path"></a>
### #memberPath()

Returns the URL path to a resource in accordance with the
values of `resourceName`, `basePath` and `nestedIn` properties:

|#resourceName|#basePath|#nestedIn|#memberPath()|
|------------|--------|--------|----|
|users|||/users/9|
|users|/api/||/api/users/9|
|users||teams/123/|/teams/123/users/9|
|users|/api/|teams/123/|/api/teams/123/users/9|

The `id` part of the URL path (`9`) derives from the `client.id` property.

Note that the default value of `basePath` property is `/`.


<a class="anchor" id="singular-path"></a>
### #singularPath()

Returns the URL path to a _singular_ resource in accordance with the
values of `resourceName`, `basePath` and `nestedIn` properties:

|#resourceName|#basePath|#nestedIn|#singularPath()|
|------------|--------|--------|----|
|account|||/account|
|account|/api/||/api/account|
|account||teams/123/|/teams/123/account|
|account|/api/|teams/123/|/api/teams/123/account|

A singular resource is a resource that clients always look up without
referencing an ID.

Note that the default value of `basePath` property is `/`.