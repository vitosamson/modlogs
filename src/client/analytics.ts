const analyticsKey = process.env.ANALYTICS_KEY;

const analyticsEnabled = () => typeof window.ga === 'function' && !!analyticsKey;

export function initAnalytics() {
  if (analyticsEnabled()) {
    window.ga('create', analyticsKey, 'auto');
    window.ga('send', 'pageview');
  }
}

export function trackPage(path: string) {
  if (analyticsEnabled()) {
    window.ga('send', 'pageview', path);
  }
}
