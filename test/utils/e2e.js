import template from 'lodash.template';
import http from 'http';


export function respond(response) {
  const t = template(response, {
    evaluate: false,
    interpolate: /\$\{([^{}]+?)}/g
  });

  return (req, res, next) => {
    res.write(t(req));
    res.end();
    next();
  };
}

export function request(options, callback) {
  let error;
  const req = http.request({
    hostname: 'localhost',
    method: 'GET',
    ...options
  }, res => {
    const data = [];
    if (!error) {
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        callback(null, {
          status: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(data)
        });
      });
      res.on('error', callback);
    }
  });

  req.on('error', function (err) {
    error = err;
    callback(err);
  });

  if (options.data) {
    req.write(options.data);
  }
  req.end();
}

export function setup({ res = respond }, router, routes) {
  routes.forEach(options => {
    const method = (options.method || 'use').toLowerCase();
    const args = [];

    if (options.url) {
      args.push(options.regexp ? new RegExp(options.url) : options.url);
    }

    if (options.response) {
      args.push(res(options.response));
    }

    router[ method ].apply(router, args);
  });
}

export function test({ describe, it, xit, expect, request: req = request, ...options }, requests) {

  requests.forEach(request => {

    describe(request.path, () => {

      it('sends expected response', done => {
        req({ ...options, ...request }, (err, { status, headers, data } = {}) => {
          const { response } = request;

          if (err) {
            done(err);
            return;
          }
          try {
            if (response.status) {
              expect(status).to.equal(response.status);
            }
            if (response.headers) {
              expect(headers).to.eql(response.headers);
            }
            if (response.data) {
              expect(data.toString()).to.eql(response.data);
            }
            done();
          }
          catch (err) {
            done(err);
          }
        });
      });

    });

  });

}

