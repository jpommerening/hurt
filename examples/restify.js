import restify from 'restify';
import hurt from 'hurt';

const router = hurt({ restify: true });
const app = restify({ router });

router.use(function(req, res, next) {
  console.log(new Date());
  next();
});

router.use('/channel/{chan}', function(req, res, next) {
  res.send(200, req.param.chan);
});

