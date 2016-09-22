# hurt

> *H*TTP routing with *UR*I *t*emplates

After all of two minutes browsing [npmjs.org](https://www.npmjs.com/search?q=6570+router) I could not find what I was looking for, so I built it myself. How hard can it be, right?


## Motivation

Not very. [RFC 6570][] specifies URI templates, of which there are [a bunch][6570libs] of very nice implementations. However, at the time of writing, full featured URI template routers for [express][], [connect][] or [restify][] were hard to come by.

So what's so great about URI templates then? For one, they have a syntax to properly describe recursive paths and arguments. This makes them great for describing APIs. Actually, you might have seen them, for example in GitHubs API documentation. Also, when you're writing a RESTful API you'll often write URLs into your service's responses. Instead of hard-coding the URLs or using some other way to generate them, you can just use the router to give you a route, because if any part of your software knows which URLs are reachable, it's your router.


## Usage

So what does `hurt` look like? _Glad you asked!_
Let's start this of with an example:

```js
import hurt from 'hurt';
import { Users } from './app/model';

const router = hurt();

router.get('/users/{name}', function (req, res, next) {
  const user = Users.get({ name: req.params.name });
  res.send(200, user);
});

router.get('/users{?q,page}', function (req, res, next) {
  const length = 10;
  const start = (req.params.page || 0) * lenth;
  const users = Users.find({ q: req.params.q }).slice(start, length);
  res.send(200, users);
});
```

Just like so many other routers, except with RFC 6570 URI templates. There are some nice bonuses though. Check out the docs.


## Installation

### npm

```console
$ npm install hurt
```

### bower

```console
$ bower install hurt
```

### html

```console
$ curl -o hurt.min.js https://github.com/jpommerening/hurt/releases/download/v0.1.0/hurt.min.js
$ echo '<script src="hurt.min.js"></script>' >> index.html
```

[RFC 6570]: https://tools.ietf.org/html/rfc6570
[6570libs]: https://github.com/medialize/URI.js#uri-template
[express]: https://expressjs.com
[connect]: https://senchalabs.github.io/connect
[restify]: https://restify.com
