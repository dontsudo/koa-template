/**
 * Return Handler With Response Time
 * @param {Object}   ctx  ctx   Koa context
 * @param {Function} next next  Next middleware
 */
const responseTimeHandler = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('api-response-time', `${ms}ms`);
};

export default responseTimeHandler;
