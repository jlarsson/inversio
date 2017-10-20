# inversio

A Promise-based dependency injection system.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![license][license-image]][license-url]
[![js-standard-style][standard-image]][standard-url]

## Motivation
- Clean and intuitive way of organizing large applications into truly separate modules
- A cure for require-hell

## The basics

Make sure you have a version of node with a native (or shim) Promise implementation. Otherwise, just install [bluebird](https://www.npmjs.com/package/bluebird).

### Create a container
```js
var container = require('inversio')()
```
> A container is repository of components. It keeps track of their names, dependencies and how and when they are instantiated.

### Register a component
```js
container.component({
  name: 'myService',
  factory: function myService_factory() { return ... }
})
```
> ```name``` must be unique (unless _timid_ or _tags_ are specified) and can be used by dependant components to reference the component. Anonymous components are allowed if tags are specified (as in ```{tags: ['a'], factory: () => {...}}```).

> ```factory``` is a function that returns a service instance or a promised service instance.

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

### Resolving components

__resolve__(_name_) is used for resolving a single component.
__inject__(_...names_, _optional factory_) is used for resolving a multiple components at once.

_resolve()_ and _inject()_ both returns promises, but evaluation of dependencies and invokation of factories will be with settled values - using natural, synchronous composition.

```js
container
  .resolve('myService')
  .then(myService => ...) <!-- resolve single component

container
  .inject('a', 'b', 'c')
  .then([a ,b ,c] => ...) <!-- resolve multiple components

container
  .inject(['a', 'b', 'c'])
  .then([a ,b ,c] => ...) <!-- resolve multiple components

container
  .inject('a', 'b', 'c', f)
  .then(value => ...) <!-- value will be f(a, b, c)

container
  .inject(['a', 'b', 'c'], f)
  .then(value => ...) <!-- value will be f(a, b, c)
```
### Timid components
A timid component must be named and may be overwritten by another component with the same name, unless already resolved.

```js
container
  .component({
    name: 'A',
    timid: true,
    factory: () => 'timid one'
  })
  .component({
    name: 'A',
    factory: () => 'the bold winner...'
  })
```

## Special dependencies

### ? (optional)
Dependencies on the form ```?foo```are resolved normally with name (```foo```) if registered, otherwise ```undefined```.

```js
container
  .resolve('?missing') // => undefined

container
  .component({name: 'a', factory: () => 'A'})
  .resolve('?a') // => 'A'
```

### require
Dependencies on the form ```'require:foo'``` are resolved with ```require('foo')``` rather than looking up a component.

```js
container
  .resolve('require:fs') // => require('fs')
```

### tag
Dependencies on the form ```'tag:bar'``` are resolved with all components tagged with ```'bar'```. The resolved result is an array of resolved dependencies.

> Tagged components can be anonymous, i.e. _name_ must not be specified.

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

Order of tagged components can be specified with ```order```:

```js
container
  .component({name: 'first', order: -100, ... })
  .component({name: 'between (no order specified, defaults to 0)', ... })
  .component({name: 'last', order: 100, ... })
```

### Decorators, mixins and subclassing
The decorator pattern and the particular case of subclassing/mixins are expressed
using (replace &lt;name&gt; below with something in your liking)
- a named root (such as a base class) named ```'super:<name>'```
- decorators (or mixins)  named ```'extends:<name>'```
- a concrete binding named ```'class:<name>'``` which combines ___super:___ and ___extends:___ in a natural way.

Decorators are expected to map from one value to another.

Consider the following composition:
```js
console.log(foo(bar('X')))
```

This can be expressed and evaluated with
```js
container
  .component({name: 'super:x', factory: () => 'X'})
  .component({tags: ['extends:x'], factory: bar})
  .component({tags: ['extends:x'], factory: foo})
  .resolve('class:x')
  .then(console.log) // --> console.log(foo(bar('X')))
```

The motivation for ___super:___, ___extends:___ and ___class:___ comes from real world applications where class composition like ```class A extends (class B extends ... extends SomeBaseClass)``` is achieved using the mechanisms above.

## Organizing express applications

> For a working example, check out the [sample-express-site](sample-express-site/)
- concerns are separated into separate modules (database, index page, blog pages, express and middleware etc)
- each module is self contained, including views and controllers
- module dependencies are injected, so there are no ```require()``` between modules

The challenge (at least for me) with larger express/koa applications is that dependencies are hard to maintain while still handling tests, structure, refactoring, technical debt and such.
My personal preference is to separate the application into modules, each with a specific and isolated concern. These modules are then bootstrapped in the main script of the application.

> An important principle when working with dependency inversion, is that code that deals with concrete dependency decisions (i.e. which module or class to instantiate) should be kept at a minimum.
In the example below, main.js knows about the actual application structure, while the modules are blissfully ignorant.

The main script, where modules are discovered, registered and composed to an aggregate that is your final application.
```js
glob('app/**/*.component.js')
  .then(function requireComponents (componentFiles) {
    return componentFiles.map(function (componentFile) {
      log('loading component %s', componentFile)
      return {
        file: componentFile,
        module: require('./' + componentFile)
      }
    })
  })
  .then(function registerComponents (components) {
    return components.reduce(function (container, component) {
      log('registering component %s', component.file)
      component.module.register(container)
      return container
    },
    inversio())
  })
  .then(function (container) {
    log('resolving express app and all routes')
    return container.inject('app', 'tag:route', function (app) {
      return app
    })
  })
  .then(function (app) {
    log('express application listing to port %s', port)
    app.listen(port)
  })
```
> ```inject(['app', 'tag:route'], ...)``` does some magic. First, it will get the registered ```app``` service, needed for ```listen()```. But it ill also trigger loading of all modules tagged with `route`, ensuring that the admin, users and blogs routes will be registered with express.
>
> The tag syntax for resolving dependencies is vey powerful for ensuring instantiation of service by category without having to know them explicitly.
>
> Globbing for modules is quite cool (in my opinion). It basically allows you just drop in a new module. If tagged as routes, they will be part of your express application.

The express module (./app/express/component.js) could be something like
```js
module.exports.register = function (container) {
  return container.component({
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
module.exports.register = function (container) {
  return container.component({
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
module.exports.register = function (container) {
  return container.component({
    name: 'db',
    factory: configureDatabase
  })
}

function configureDatabase() {
  return require('levelup')('./data')
}
```

> Having scattered ```component.js``` files, each exporting a function ```register``` for its module registrations, is only a convention used in this example. Other ways of discovering and bootstrapping modules are certainly possible.

[travis-image]: https://img.shields.io/travis/jlarsson/inversio.svg?style=flat
[travis-url]: https://travis-ci.org/jlarsson/inversio
[npm-image]: https://img.shields.io/npm/v/inversio.svg?style=flat
[npm-url]: https://npmjs.org/package/inversio
[license-image]: https://img.shields.io/npm/l/inversio.svg?style=flat
[license-url]: LICENSE.md
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
