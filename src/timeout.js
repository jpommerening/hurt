'use strict';

export default function timeout(delay, handle) {
  return function (req, res, next) {
    res.setTimeout(delay, function() {
      return handle(req, res, function() {});
    });
    next();
  };
}
