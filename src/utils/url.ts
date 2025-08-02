export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080';
  }

  const { protocol, hostname, port } = window.location;
  
  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${port}`;
  }
  
  // Production environment (Netlify, Vercel, or any other hosting)
  return `${protocol}//${hostname}`;
};

export const getPasswordResetUrl = (): string => {
  return `${getBaseUrl()}/auth?type=recovery`;
};