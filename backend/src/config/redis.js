import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully.');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

/**
 * Store refresh token hash in Redis
 * @param {string} userId - User ID
 * @param {string} tokenHash - Hashed refresh token
 * @param {number} expiresInSeconds - Expiration time in seconds
 */
export async function storeRefreshToken(userId, tokenHash, expiresInSeconds) {
  const key = `refresh_token:${userId}:${tokenHash}`;
  await redis.setex(key, expiresInSeconds, 'valid');
}

/**
 * Check if refresh token is valid
 * @param {string} userId - User ID
 * @param {string} tokenHash - Hashed refresh token
 */
export async function isRefreshTokenValid(userId, tokenHash) {
  const key = `refresh_token:${userId}:${tokenHash}`;
  const result = await redis.get(key);
  return result === 'valid';
}

/**
 * Revoke refresh token
 * @param {string} userId - User ID
 * @param {string} tokenHash - Hashed refresh token
 */
export async function revokeRefreshToken(userId, tokenHash) {
  const key = `refresh_token:${userId}:${tokenHash}`;
  await redis.del(key);
}

/**
 * Revoke all refresh tokens for a user
 * @param {string} userId - User ID
 */
export async function revokeAllUserTokens(userId) {
  const pattern = `refresh_token:${userId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Add token to blacklist
 * @param {string} token - Token to blacklist
 * @param {number} expiresInSeconds - Time until token naturally expires
 */
export async function blacklistToken(token, expiresInSeconds) {
  const key = `blacklist:${token}`;
  await redis.setex(key, expiresInSeconds, 'revoked');
}

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 */
export async function isTokenBlacklisted(token) {
  const key = `blacklist:${token}`;
  const result = await redis.get(key);
  return result === 'revoked';
}

export default redis;

