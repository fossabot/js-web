import config from '../config';

export async function getReCaptchaToken(action?: string) {
  const siteKey = config.RECAPTCHA_SITE_KEY;
  if (typeof window === 'undefined' || !siteKey) {
    return 'DISABLED';
  }
  await new Promise<void>((resolve) => window.grecaptcha.ready(resolve));
  const token = await window.grecaptcha.execute(siteKey, {
    action,
  });

  return token;
}
