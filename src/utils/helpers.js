/**
 * Convert a date string to relative time (e.g., "2 hours ago")
 */
export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Debounce a function call
 */
export function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get CSS class for a category badge
 */
export function getCategoryBadgeClass(category) {
  const map = {
    ai: 'badge-ai',
    cloud: 'badge-cloud',
    security: 'badge-security',
    devops: 'badge-devops',
    data: 'badge-data',
    technology: 'badge-technology',
  };
  return map[category] || 'badge-technology';
}

/**
 * Get display label for a category
 */
export function getCategoryLabel(category) {
  const map = {
    ai: '🤖 AI/ML',
    cloud: '☁️ Cloud',
    security: '🔒 Security',
    devops: '⚙️ DevOps',
    data: '📊 Data',
    technology: '💻 Tech',
  };
  return map[category] || '💻 Tech';
}

/**
 * Get CSS class for a cloud provider
 */
export function getProviderClass(provider) {
  const map = {
    aws: 'provider-aws',
    azure: 'provider-azure',
    gcp: 'provider-gcp',
  };
  return map[provider] || '';
}

/**
 * Get demand level badge class
 */
export function getDemandClass(level) {
  const map = {
    'high': 'demand-high',
    'very-high': 'demand-very-high',
    'critical': 'demand-critical',
  };
  return map[level] || 'demand-high';
}

/**
 * Get demand label
 */
export function getDemandLabel(level) {
  const map = {
    'high': '🔥 High Demand',
    'very-high': '🔥🔥 Very High',
    'critical': '🚨 Critical Demand',
  };
  return map[level] || '🔥 In Demand';
}

/**
 * Generate skeleton loading cards
 */
export function renderSkeletons(container, count, className = 'skeleton-card') {
  container.innerHTML = Array(count)
    .fill(`<div class="skeleton ${className}"></div>`)
    .join('');
}
