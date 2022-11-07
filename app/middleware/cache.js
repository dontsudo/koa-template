import Redis from 'ioredis';
import blake3 from 'blake3';
import logger from './logger.js';

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis();

let isRedisAvailable = false;

redis
  .on('error', () => {
    isRedisAvailable = false;
  })
  .on('end', () => {
    isRedisAvailable = false;
  })
  .on('ready', () => {
    isRedisAvailable = true;
    logger.info('REDIS Connected');
  });

/**
 *
 * @param   {String}    str String to hash
 * @returns {String}    Hashed String
 */
const hash = (str) => blake3.createHash().update(str).digest('hex');

/**
 * Redis cache middleware
 *
 * @param   {Number} ttl Cache TTL in seconds
 * @returns {void}
 */
const cacheHandler = (ttl) => async (ctx, next) => {
  if (process.env.NODE_ENV !== 'production') {
    await next();
    return;
  }

  if (!isRedisAvailable) {
    ctx.response.set('api-cache-online', 'false');
    await next();
    return;
  }

  ctx.response.set('api-cache-online', 'true');

  const { url, method } = ctx.request;
  const key = `cache:${hash(
    `${method}${url}${JSON.stringify(ctx.request.body)}`,
  )}`;

  if (ttl) {
    ctx.response.set('Cache-Control', `max-age=${ttl}`);
  } else {
    ctx.response.set('Cache-Control', 'no-store');
  }

  // Only allow cache on whitelist methods
  if (!['GET', 'POST'].includes(ctx.request.method)) {
    await next();
    return;
  }

  let cached;
  try {
    // GET
    cached = await redis.get(key);
    if (cached) {
      ctx.response.status = 200;
      ctx.response.set('api-cache', 'HIT');
      ctx.response.type = 'application/json';
      ctx.response.body = cached;
      cached = true;
    }
  } catch (error) {
    cached = false;
  }

  if (cached) {
    return;
  }
  await next();

  const responseBody = JSON.stringify(ctx.response.body);
  ctx.response.set('api-cache', 'MISS');

  // SET
  try {
    if (ctx?.response?.status !== 200 || !responseBody) {
      return;
    }
    await redis.set(key, responseBody, 'EX', 'ttl');
  } catch (error) {
    logger.error(`Failed to set cache: ${error.message}`);
  }
};

export default cacheHandler;
