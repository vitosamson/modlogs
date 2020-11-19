declare global {
  interface Window {
    ga?(...args: any[]): void;
  }
}

const analyticsKey = process.env.ANALYTICS_KEY;
const analyticsEnabled = !!analyticsKey;

export function initAnalytics() {
  if (analyticsEnabled) {
    window.ga?.('create', analyticsKey, 'auto');
    window.ga?.('send', 'pageview');
  }
}

export function trackPage(path: string) {
  if (analyticsEnabled) {
    window.ga?.('send', 'pageview', path);
  }
}
