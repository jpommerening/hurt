const hasOwnProperty = Object.prototype.hasOwnProperty;
const arrayPush = Array.prototype.push;

function proxy(target, name) {
  return Object.create(target, {
    [name]: Object.getOwnPropertyDescriptor(target, name)
  });
}

function bind(fn, thisArg) {
  function bound() {
    const returnValue = fn.apply(thisArg, arguments);
    return (returnValue === thisArg) ? this : returnValue;
  }

  Object.defineProperty(bound, 'name', { value: `proxied ${fn.name}`, configurable: true });
  return bound;
}

export default function mixin(target, mixin) {
  Object.getOwnPropertyNames(mixin).forEach(name => {
    const descriptor = Object.getOwnPropertyDescriptor(mixin, name)
    const exists = hasOwnProperty.call(target, name);
    const self = exists ? proxy(target, name) : target;

    if (exists && Array.isArray(target[name])) {
      arrayPush.apply(target[name], Array.isArray(descriptor.value) ? descriptor.value : [descriptor.value]);
      return;
    }

    if (typeof descriptor.value === 'function') {
      descriptor.value = bind(descriptor.value, self);
    }

    Object.defineProperty(target, name, descriptor)
  });
}
