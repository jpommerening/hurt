
export function mixin(options) {
  return {
    get restify() {
      const router = this;
      return {
        name: 'HurtRouter',
        mounts: {},
        versions: ['0.0.0'],
        types: [],
        on: router.on.bind(router),
        off: router.off.bind(router),
        emit: router.emit.bind(router),
        mount(options) {
          const name = options.name;
          const route = {
            name,
            method: options.method,
            spec: options,
            types: options.types || this.types,
            versions: options.versions || this.versions
          };

          this.mounts[name] = route;
          router.use(options.path || options.url, (req, next) => {
            req.route = route;
            next();
          });

          return name;
        },
        get(name, req, callback) {
          // TODO!
          router(req, err => {
            if (err) {
              callback(err);
            }
            else {
              callback(null, this.mounts[name], req.params);
            }
          });
        },
        find(req, res, callback) {
          router(req, err => {
            if (err) {
              callback(err);
            }
            else {
              callback(null, req.route, req.params);
            }
          });
        }
      };
    }
  };
};
