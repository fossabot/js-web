import faker from 'faker';
import bcrypt from 'bcrypt';

/**
 * Create a bcrypt hash for a string.
 *
 * @param {string} data
 * @returns {Promise<string>}
 */
export function hash(data: string) {
  const saltRounds = parseInt(process.env.AUTH_SALT_ROUNDS || '10', 10); // TODO: Consume config from provider

  return bcrypt.hash(data, saltRounds);
}

/**
 * Compare a string with the hash.
 *
 * @param {string} data
 * @param {string} hashed
 * @returns {Promise<boolean>}
 */
export function compare(data: string, hashed: string) {
  return bcrypt.compare(data, hashed);
}

/**
 * Generate a random password hash.
 *
 * @returns {Promise<string>}
 */
export function getRandomHash() {
  return hash(faker.internet.password());
}
