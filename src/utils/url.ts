// src/utils/url.ts

export const getBaseUrl = (): string => {
  // This will dynamically return `https://kaayan.store` in production
  // or `http://localhost:8080` in development, because this code
  // is executed in the user's browser.
  return window.location.origin;
};

export const getPasswordResetUrl = (): string => {
  // This is the URL the user is sent to AFTER the password reset.
  // It must be listed in your Supabase "Redirect URLs".
  const redirectUrl = `${getBaseUrl()}/auth?type=recovery`;
  return redirectUrl;
};