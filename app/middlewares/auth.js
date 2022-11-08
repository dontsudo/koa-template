import mongoose from 'mongoose';

const db = mongoose.connection.useDb('auth', { useCache: true });

/**
 * Auth Middleware
 *
 * @param {Object}   ctx  Next context
 * @param {Function} next Next function
 */
export default async (ctx, next) => {
  const key = ctx.request.headers['api-key'];
  if (key) {
    const user = await db.collection('users').findOne({ key });
    if (user?.key === key) {
      ctx.state.roles = user.roles;
      await next();
      return;
    }
  }
  ctx.status = 401;
  ctx.body = 'https://youtu.be/RfiQYRn7fBg';
};
