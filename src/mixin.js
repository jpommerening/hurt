import { proxy, bind } from './_util';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const arrayPush = Array.prototype.push;


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

    try {
      Object.defineProperty(target, name, descriptor)
    }
    catch (e) {
      //eslint-disable-no-empty
    }
  });
}
