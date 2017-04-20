export function noop() {}

export function replace(list, item, old) {
  const index = list.indexOf(old);

  if( index < 0 ) {
    list.push(item);
  } else {
    list[ index ] = item;
  }
  return item;
}

/**
 * Returns an object prototypicaly proxying the given target, but
 * statically binding the name property to its current value. If the
 * current value is a function it is, in turn, bound to the un-proxied
 * target object.
 */
export function proxy(target, name) {
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
export function bind(fn, thisArg) {
  function bound() {
    const returnValue = fn.apply(thisArg, arguments);
    return (returnValue === thisArg) ? this : returnValue;
  }
  return bound;
}

