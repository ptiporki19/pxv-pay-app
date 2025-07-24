/**
 * Device detection utilities for mobile checkout routing
 */

export function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

export function getDeviceType(userAgent: string): 'mobile' | 'desktop' {
  return isMobileDevice(userAgent) ? 'mobile' : 'desktop';
}

export function shouldRedirectToMobile(userAgent: string, currentPath: string): boolean {
  // Check if user is on mobile and accessing desktop checkout
  return isMobileDevice(userAgent) && currentPath.startsWith('/c/') && !currentPath.includes('/c/m/');
}

export function shouldRedirectToDesktop(userAgent: string, currentPath: string): boolean {
  // Check if user is on desktop and accessing mobile checkout
  return !isMobileDevice(userAgent) && currentPath.includes('/c/m/');
}

export function getMobileCheckoutUrl(slug: string): string {
  return `/c/m/${slug}`;
}

export function getDesktopCheckoutUrl(slug: string): string {
  return `/c/${slug}`;
}