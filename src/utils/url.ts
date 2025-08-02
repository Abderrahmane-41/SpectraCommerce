export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080';
  }

  const { protocol, hostname, port } = window.location;
  
  console.log('Current location:', { protocol, hostname, port }); // Debug log
  
  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Make sure we use the correct port
    const currentPort = port || '8080';
    return `${protocol}//${hostname}:${currentPort}`;
  }
  
  // Production environment
  return `${protocol}//${hostname}`;
};

export const getPasswordResetUrl = (): string => {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth?type=recovery`;
  console.log('Generated reset URL:', resetUrl); // Debug log
  return resetUrl;
};