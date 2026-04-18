// API base URL — in production set VITE_API_BASE_URL to your Render backend URL
// e.g. https://tech-pulse-api.onrender.com
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

async function fetchJSON(endpoint, params = {}) {
  const fullUrl = new URL(endpoint, window.location.origin);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      fullUrl.searchParams.set(key, val);
    }
  });

  try {
    const response = await fetch(fullUrl.toString());
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error || 'Unknown API error');
    }
    return json.data;
  } catch (error) {
    console.error(`API fetch failed: ${endpoint}`, error);
    throw error;
  }
}

export async function fetchTechNews(category = 'all', max = 20) {
  return fetchJSON(`${API_BASE}/tech-news`, { category, max });
}

export async function fetchCloudUpdates(provider = 'all', max = 15) {
  return fetchJSON(`${API_BASE}/cloud-updates`, { provider, max });
}

export async function searchNews(query, max = 10) {
  return fetchJSON(`${API_BASE}/search`, { q: query, max });
}

export async function fetchTrending(limit = 10) {
  return fetchJSON(`${API_BASE}/trending`, { limit });
}

export async function fetchRecommendations(limit = 6) {
  return fetchJSON(`${API_BASE}/recommendations`, { limit });
}
