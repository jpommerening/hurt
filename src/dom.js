const noop = () => {};

export function finish() {
  return function (req, res, next = noop) {
    next();
  };
}

export function timeout(delay, handler = noop) {
  return function(...args) {
    const next = args.pop();
    if (delay) {
      setTimeout(() => {
        handler(...args, noop);
      });
    }
    next();
  };
}

export function attach(window, handler, options = {}) {
  const {
    history,
    location,
    document
  } = window;

  let submit = null;

  const base = (options.base ? parseUrl(options.base).href : document.baseURI)
    .replace(/\/$/, '');

  function eventListener (event) {
    const { target, type, altKey, metaKey } = event;

    if (altKey || metaKey) {
      return;
    }

    if (type === 'click' && target.localName === 'button' && target.type === 'submit') {
      submit = target;
    }
    if (type === 'click' && target.localName === 'a' && target.href) {
      const { href: url } = parseUrl(target.href);
      run({ url, event });
    }
    if (type === 'submit' && target.localName === 'form' && target.action) {
      const { href: url } = parseUrl(/*submit.formAction ||*/ target.action);
      const method = submit.formMethod || target.method;
      submit = null;
      run({ url, method, event });
    }
  }

  document.addEventListener('submit', eventListener);
  document.addEventListener('click', eventListener);

  window.addEventListener('popstate', function (event) {
    const { href: url } = parseUrl(location.href);

    run({ url, replace: true, state: history.state, event });
  });

  function run({ url, event, ...options }, callback = () => {}) {
    const req = {
      method: (options.method || 'GET').toUpperCase(),
      replace: options.replace || false,
      state: options.state || {}
    };

    if (url.substr(0, base.length) !== base) {
      return false;
    }

    req.url = url.substr(base.length);
    req.baseUrl = base;

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    handler(req, {}, function (err) {
      if (err) {
        callback(err);
        return;
      }

      try {
        const method = req.replace ? history.replaceState : history.pushState;
        const state = req.state;
        method.call(history, state, state.title, base + req.url);
        callback(null, state);
      }
      catch (err) {
        callback(err);
      }
    });
    return true;
  }

  function parseUrl(href) {
    const a = document.createElement('a');
    a.href = href;
    return {
      href: a.href,
      pathname: a.pathname,
      search: a.search
    };
  }
}

export function mixin(options = {}) {
  let finish_ = finish();
  let timeout_ = timeout(options.timeout, finish_);

  return {
    pre: [ timeout_ ],
    post: [ finish_ ],
    attach(window = options.window) {
      attach(window, this, options);
      return this;
    },
    timeout(delay, handler) {
      const index = this.pre.indexOf( timeout_ );

      timeout_ = timeout(delay || options.timeout, handler || finish_);

      if( index < 0 ) {
        this.pre.push( timeout_ );
      } else {
        this.pre[ index ] = timeout_;
      }
      return this;
    }
  };
}
