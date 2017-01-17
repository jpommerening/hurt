const hasOwnProperty = Object.prototype.hasOwnProperty;
const arrayPush = Array.prototype.push;

/**
 * Returns an object prototypicaly proxying the given target, but
 * statically binding the name property to its current value. If the
 * current value is a function it is, in turn, bound to the un-proxied
 * target object.
 */
function proxy(target, name) {
  const descriptor = Object.getOwnPropertyDescriptor(target, name);
  if (typeof descriptor.value === 'function') {
    descriptor.value = bind(descriptor.value, target);
  }
  return Object.create(target, {
    [name]: descriptor
  });
}

/**
 * Bind the given function's `this` to the given object. If, however, the
 * function returns `this`, it will be replaced with the `this` the bound
 * function was called with.
 */
function bind(fn, thisArg) {
  function bound() {
    const returnValue = fn.apply(thisArg, arguments);
    return (returnValue === thisArg) ? this : returnValue;
  }

  if (Object.getOwnPropertyDescriptor(bound, 'name').configurable) {
    Object.defineProperty(bound, 'name', { value: `proxied ${fn.name}`, configurable: true });
  }
  return bound;
}

export default function mixin(target, mixin) {
  Object.getOwnPropertyNames(mixin).forEach(name => {
    const descriptor = Object.getOwnPropertyDescriptor(mixin, name)
    const exists = hasOwnProperty.call(target, name);

    if (exists && Array.isArray(target[name])) {
      arrayPush.apply(target[name], Array.isArray(descriptor.value) ? descriptor.value : [descriptor.value]);
      return;
    }

    if (typeof descriptor.value === 'function') {
      descriptor.value = bind(descriptor.value, exists ? proxy(target, name) : target);
    }

    Object.defineProperty(target, name, descriptor)
  });
}
