const noop = () => {};

export function finish() {
  return function (req, res, next = noop) {
    if (res.timeout) {
      clearTimeout(res.timeout);
      res.timeout = null;
    }
    if (!res.finished) {
      res.finished = true;
    }
    next();
  };
}

export function timeout(delay, handler = noop) {
  return function(req, res, next) {
    if (delay) {
      res.timeout = setTimeout(() => {
        handler(req, res, noop);
      }, delay);
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

  const base = (options.base ? canonicalizeUrl(options.base) : document.baseURI)
    .replace(/\/$/, '');

  let submit = null;

  document.addEventListener('click', event => {
    const { target, altKey, metaKey } = event;

    if (altKey || metaKey) {
      return;
    }

    if (target.localName === 'button' && target.type === 'submit') {
      submit = target;
    }
    if (target.localName === 'a' && target.href) {
      run({ url: target.href, event });
    }
  });

  document.addEventListener('submit', event => {
    const { target } = event;

    if (target.localName === 'form' && target.action) {
      const url = canonicalizeUrl(/*submit.formAction ||*/ target.action);
      const method = submit.formMethod || target.method;
      submit = null;
      run({ url, method, event });
    }
  });

  window.addEventListener('popstate', function (event) {
    run({ url: location.href, replace: true, state: history.state, event });
  });

  function run({ url, event, ...options }) {
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
        return;
      }

      const method = req.replace ? history.replaceState : history.pushState;
      const state = req.state;
      method.call(history, state, state.title, base + req.url);
    });
  }

  function canonicalizeUrl(href) {
    const a = document.createElement('a');
    a.href = href;
    return a.href;
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
