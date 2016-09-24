'use strict';

import template from 'uri-templates';

export default function router(routes) {
  if (Array.isArray(routes)) {
    routes.forEach(route => this.use(route));
  } else if (routes) {
    Object.keys(routes).forEach(path => this.use(path, routes[path]));
  }
}

function regExpPrefix(regexp) {
  const source = regexp.source;
  const index = source.search(/([^\]\.|\\[dDsSwWxu]|\(\[)/);
  return source.substr(0, index).replace(/\\([\\().*\[\]])/g, '$1');
}

function uriPrefix(uri) {
  const index = uri.indexOf('{');
  return uri.substr(0, index);
}

function route(test, ...stack) {
  function handle(req, res, next) {
    const stack = [].concat(handle.stack);
    const tests = handle.tests;
    let active = false;
    let called = false;

    if (tests.every(test => test(req, res))) {
      return iter();
    } else {
      return next();
    }

    function iter() {
      // flatten stack when called sync
      if (active) {
        called = true;
        return;
      }

      active = true;

      do {
        let fn = stack.shift();
        called = false;
        if (fn) {
          fn(req, res, iter);
        } else {
          next();
        }
      } while (called);

      active = false;
    }
  }

  handle.stack = stack;
  handle.tests = [ test ];

  return handle;
}

export class Route {
  constructor(callback) {
    this.callback = callback;
  }
  handle(req, res, next) {
    return this.callback.call({}, req, res, next);
  }
}

export class UriRoute extends Route {
  constructor(uri, callback) {
    super(callback);
    this.prefix = uri;
    this.match = reqUrl => reqUrl === uri;
    this.handle = route(req => req.params = this.match(req.url), this.callback);
  }
}

export class RegExpRoute extends UriRoute {
  constructor(uri, callback) {
    super(regExpPrefix(uri), callback);
    this.match = reqUrl => {
      const match = uri.exec(reqUrl);
      if (match && match.index === 0) {
        return match;
      }
      return false;
    };
  }
}

export class TemplateRoute extends UriRoute {
  constructor(uri, callback) {
    super(uriPrefix(uri), callback);
    const t = template(uri);
    this.match = reqUrl => {
      const match = t.fromUri(reqUrl);
      if (match) {
        return match;
      }
      return false;
    };
  }
}

export class MethodRoute extends Route {
  constructor(method, callback) {
    super(callback);
    this.method = method.toUpperCase();
  }
  handle(req, res, next) {
    if (this.method === req.method) {
      return Route.prototype.handle.apply(this, arguments);
    }
    return next();
  }
}

export class Router {
  constructor(options) {
    this.options = options;
    this.routes = [];
  }
  mount(route) {
    this.routes.push(route);
  }
  get(uri, callback) {
    this.mount(new MethodRoute('GET', callback));
  }
}
