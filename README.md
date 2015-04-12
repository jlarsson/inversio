# inversio

A working dependency injection system for express and koa.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![license][license-image]][license-url]
[![js-standard-style][standard-image]](standard-url)

## Motivation
- I needed a clean and intuitive way of organizing large applications into truly separate modules
- I wanted out of require-hell

Before this write up, I have tried approaches such as [this](https://strongloop.com/strongblog/modular-node-js-express/) and different [libraries](http://www.mariocasciaro.me/dependency-injection-in-node-js-and-other-architectural-patterns), with little satisfaction.

[https://github.com/c9/architect](Architect) deserves a special mention, since it in my opinion can be used as a solid starting point for many projects.


## The basics

### Create a container
```js
var container = require('inversio')
```
> A container is repository of components. It keeps track of their names, dependecies and how and when they are instantiated.

### Register a component
```js
container.component({
  name: 'myService',
  factory: function myService_factory() { return ... }
})
```
> ```name``` must be unique and can be used by dependant components to reference the component.
```factory``` is a function that returns a service instance or a promised service instance.

> **Important**: the factory is invoked only once during the container lifetime, effectively making components singletons.

### Register dependent components
```js
container
  .component({
    name: 'A',
    depends: ['myService']
    factory: function A_factory(myService) { return ... }
  })
  .component({
    name: 'B',
    depends: ['myService', 'A']
    factory: function B_factory(myService, a) { return ... }
  })
```
> Note that dependecies to other components are explitly listed in ```depends``` and that the factories have a corresponding argument list.

### Inject components
```js
container.inject('A', 'B', function b_inject(a, b) {
  // b will be the value returned from B_factory above.
})
```
Since B is dependent on both myService and A, and A is dependent on myService, the above is schematically equivalent (ignoring the singleton aspect) to
```js
var c1 = myService_factory()
var c2 = A_factory(c1)
var c3 = B_factory(c1, c2)
b_inject(c2, c3)
```

## Special dependencies

### require
Dependencies on the form ```'require:foo'``` are resolved with ```require('foo')``` rather than looking up a component.

### tag
Dependencies on the form ```'tag:bar'``` are resolved with all components tagged with ```'bar'```.

Tagging is straightforward:
```js
container
  .component({
    name: 'x',
    tags: ['bar', 'baz']
    factory: ...
  })

```

> Tagging is powerful, since it allows dependencies on the form ***is a*** rather than ***is***.

## Organizing express applications

> For a working example, check out the [sample-express-site](sample-express-site/)
- concerns are separated into separate modules (database, index page, blog pages, express and middleware etc)
- each module is self contained, including views and controllers
- module dependencies are injected, so there are no ```require()``` between modules

The challenge (at least for me) with larger express/koa applications is that dependencies are hard to maintain while still handling tests, structure, refactoring, technical debt and such.
My personal preference is to separate the application into modules, each with a specific and isolated concern. These modules are then bootstrapped in the main script of the application.

> An important principle when working with dependency inversion, is that code that deals with concrete dependency decisions (i.e. which module or class to instantiate) should be kept at a minimum.
In the example below, main.js knows about the actual application structure, while the modules are blissfully ignorant.

The main script, where modules are listed, registered and composed to an aggregate that is your final application.
```js
// register interesting modules
['./app/express/component.js',
'./app/database/component.js',
'./app/admin/component.js',
'./app/users/component.js',
'./app/blogs/component.js']
.map(function (m) {
  // load each module
  return require(m)
})
.reduce(function (inversio, component) {
  // let each module register it self
  component.register(inversio)
}, inversio() /* the container active in reduction */)
.inject(['app', 'tag:route'], function (app, routes) {
  // get service app + all services tagged as routes
  // and start listening
  app.listen(300)
})
```
> ```inject(['app', 'tag:route'], ...)``` does some magic. First, it will get the registered ```app``` service, needed for ```listen()```. But it ill also trigger loading of all modules tagged with `route`, ensuring that the admin, users and blogs routes will be registered with express.
>
> The tag syntax for resolving dependencies is vey powerful for ensuring instantiation of service by category without having to know them explicitly.

The express module (./app/express/component.js) could be something like
```js
module.exports.register = function (inversio) {
  return inversio.component({
    name: 'app',
    factory: createApp
  })
}

function createApp() {
  var app = express()
  // Setup require middleware
  // app.use(...)
  return app
}
```

The users/admin/blogs module could be something like
```js
module.exports.register = function (inversio) {
  return inversio.component({
    name: 'users',
    depends: ['app', 'db']
    tags: ['route']
    factory: setupRoutes
  })
}

function setupRoutes(app, db) {
  // setup routes
  // app.get(...)
  // app.post(...)
}
```

The database logic could be isolated as
```js
module.exports.register = function (inversio) {
  return inversio.component({
    name: 'db',
    factory: configureDatabase
  })
}

function configureDatabase() {
  return require('levelup')('./data')
}
```

> Having scattered ```component.js``` files, each exporting a function ```register``` for its module registrations, is only a convention used in this example. Other ways of discovering and bootstrapping modules are certainly possible.

## Why not skip dependency injection and just stick to require()?
```require()``` has the inherent property of binding to concrete implementations.
> In practice, code dependent on required components are tricky to test in isolation.

```require('../../../../foo/bar')``` and other hard to track dependencies will be the price for maintaining an otherwise sound project structure.
> Any structure of practice that makes refactoring harder, affects quality (negatively)

Sharing global policies can be tricky.
> A simple task such as loading and parsing configuration properties often leads to duplicated code.

[travis-image]: https://img.shields.io/travis/jlarsson/inversio.svg?style=flat
[travis-url]: https://travis-ci.org/jlarsson/inversio
[npm-image]: https://img.shields.io/npm/v/inversio.svg?style=flat
[npm-url]: https://npmjs.org/package/inversio
[license-image]: https://img.shields.io/npm/l/inversio.svg?style=flat
[license-url]: LICENSE.md
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
