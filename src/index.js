'use strict';

import template from 'uri-templates';
import handler from './handler';
import conditional from './conditional';
import timeout from './timeout';
import { jit } from './optimize';

export function router(options) {
  const stack = [];
  const fn = jit(stack, options);

  Router.use = function (handler) {
    stack.push(handler);
    return Router;
  };

  Router.timeout = function (delay, handler) {
    stack.unshift(timeout(delay, handler));
    return Router;
  };

  return Router;

  function Router(req, res) {
    return fn(req, res, function() {
      if (!res.finished) {
        res.end();
      }
    });
  }
}

export default router;

function everyfn(fns) {
  if (fns.length === 0) {
    return () => true;
  }
  return (...args) => fns.every(fn => fn(...args));
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
  const tests = Array.isArray(test) ? test : [test];
  const handle = handler(stack);
  const route = conditional(everyfn(tests), handle);

  route.stack = stack,
  route.tests = tests;
  route.handle = handle;

  return route;
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
  put(uri, callback) {
    this.mount(new MethodRoute('PUT', callback));
  }
  post(uri, callback) {
    this.mount(new MethodRoute('POST', callback));
  }
  handle(req, res, next) {
    if (!this.handler) {
      this.handler = handler(this.routes.map(r => r.handle.bind(r)));
    }
    this.handler(req, res, next);
  }
}
