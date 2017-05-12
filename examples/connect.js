import connect from 'connect';
import hurt from 'hurt';
import log from 'log';

const app = connect();
const router = hurt();

router.use(function(req, res, next) {
  log.info('%s %s', req.method, req.url);
  next();
});

router.use('/channel/{chan}', function(req, res) {
  res.send(200, req.param.chan);
});

app.use(router);
