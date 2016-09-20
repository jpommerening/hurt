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
  const index = regexp.search(/([^\]\.|\\[dDsSwWxu]|\(\[)/);
  return source.substr(0, index).replace(/\\([\\().*\[\]])/g, '$1');
}

function uriPrefix(uri) {
  const index = uri.indexOf('{');
  return uri.substr(0, index);
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
  }
  handle(req, res, next) {
    const params = this.match(req.url);
    if (params) {
      req.params = params;
      return Route.prototype.handle.apply(this, arguments);
    }
    return next();
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


