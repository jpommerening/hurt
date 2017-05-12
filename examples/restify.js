import restify from 'restify';
import hurt from 'hurt';
import log from 'log';

const router = hurt({ restify: true });
const app = restify({ router });

router.use(function(req, res, next) {
  log.infp('%s %s', req.method, req.url);
  next();
});

router.use('/channel/{chan}', function(req, res) {
  res.send(200, req.param.chan);
});

