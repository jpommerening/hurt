export function mixin({ name = '' } = {}) {
  const routes = {};

  return {
    name,
    route(...args) {
      const name = args.reduce((name, options) => (name || options.name), '');
      const route = routes[ name ] || this.route(...args);
      if (route.name) {
        routes[ name ] = route;
      }
      return route;
    }
  };
}
