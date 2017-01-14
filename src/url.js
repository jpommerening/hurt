import { add, match } from './trie';
import handler from './handler';

import uriTemplate from 'uri-templates';

function templatePrefix(template) {
  const index = template.indexOf('{');
  const prefix = index < 0 ? template : template.substr(0, index);
  return prefix;
}

function templateParams(template) {
  const t = uriTemplate(template);
  return url => t.fromUri(url);
}

function regExpPrefix(regexp) {
  const source = regexp.source;
  const match = /(^|[^\\])([[({.]|\\[dDsSwWxu])/.exec(source);
  const prefix = match ? source.substr(0, match.index + match[1].length) : source;
  return prefix.replace(/\\([/\\().*\[\]])/g, '$1');
}

function regExpParams(regexp) {
  return url => regexp.exec(url);
}

function routeHandler(params, stack) {
  const fn = handler(stack);

  return function (req, ...args) {
    const next = args.pop();
    const match = params(req.url);

    if (match) {
      req.params = Object.assign(req.params || {}, match);
      fn.call(this, req, ...args, function (err) {
        if (!err) {
          req.handled = true;
        }
        next(err);
      });
    }
    else {
      next();
    }
  };
}

function notfoundHandler(stack) {
  const fn = handler(stack);

  return function (req, ...args) {
    const next = args.pop();

    if (!req.handled) {
      fn.call(this, req, ...args, next);
    }
    else {
      next();
    }
  };
}

export function mixin() {
  const tries = [{}];
  const notfound = [];

  return {
    post: [
      notfoundHandler(notfound)
    ],
    use: function (url, ...stack) {
      let prefix;
      let params;

      if (typeof url === 'string') {
        prefix = templatePrefix(url);
        params = templateParams(url);
      }
      else if (url instanceof RegExp) {
        prefix = regExpPrefix(url);
        params = regExpParams(url);
      }
      else {
        tries.push({});
        return this.use(url, ...stack);
      }

      const trie = tries.pop();
      const index = tries.length;

      tries.push(add(trie, prefix, [ routeHandler(params, stack) ]));

      if (Object.keys(trie).length === 0) {
        return this.use(function (req, ...args) {
          const stack = match(tries[ index ], req.url, []);
          const next = args.pop();

          if (stack.length) {
            handler(stack).call(this, req, ...args, next);
          }
          else {
            next();
          }
        });
      }
      else {
        return this;
      }
    },
    notfound(...stack) {
      notfound.push.apply(notfound, stack);
      return this;
    }
  };
}
