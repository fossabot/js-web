export function getRandomEmail(domain = 'yopmail.com'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let email = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 15; i++) {
    email += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${email}@${domain}`;
}
