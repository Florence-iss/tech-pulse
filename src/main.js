import { fetchTechNews, fetchCloudUpdates, searchNews, fetchTrending, fetchRecommendations } from './services/api.js';
import {
  timeAgo, truncate, debounce,
  getCategoryBadgeClass, getCategoryLabel,
  getProviderClass, getDemandClass, getDemandLabel,
  renderSkeletons,
} from './utils/helpers.js';

// ===========================
// State
// ===========================
let currentTab = 'news';
let newsData = [];
let cloudData = [];
let trendingData = [];
let recommendationsData = [];
let autoRefreshTimer = null;

// Bookmarks — persisted in localStorage
let bookmarks = JSON.parse(localStorage.getItem('tp-bookmarks') || '[]');

// Theme — persisted in localStorage
let isDarkMode = localStorage.getItem('tp-theme') !== 'light';

// ===========================
// DOM References
// ===========================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ===========================
// Theme
// ===========================
function initTheme() {
  applyTheme(isDarkMode);
  $('themeToggle')?.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('tp-theme', isDarkMode ? 'dark' : 'light');
    applyTheme(isDarkMode);
  });
}

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const btn = $('themeToggle');
  if (btn) btn.title = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  if (btn) btn.innerHTML = dark
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ===========================
// Tab Navigation
// ===========================
function initTabs() {
  $$('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Also allow clicking stat cards to switch tabs
  $$('.stat-card').forEach((card) => {
    card.addEventListener('click', () => {
      const tab = card.dataset.tab;
      if (tab) {
        switchTab(tab);
        // Ensure we scroll down slightly so the user sees the tab switch if on mobile
        $('tabNav')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  $$('.tab-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  $$('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `panel${capitalize(tab)}`));
  loadTabData(tab);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===========================
// Data Loading
// ===========================
async function loadTabData(tab) {
  switch (tab) {
    case 'news':
      if (newsData.length === 0) await loadNews();
      break;
    case 'cloud':
      if (cloudData.length === 0) await loadCloud();
      break;
    case 'trending':
      if (trendingData.length === 0) await loadTrending();
      break;
    case 'recommendations':
      if (recommendationsData.length === 0) await loadRecommendations();
      break;
    case 'bookmarks':
      renderBookmarksTab();
      break;
  }
}

async function loadNews(category = 'all') {
  const grid = $('newsGrid');
  renderSkeletons(grid, 6);

  try {
    newsData = await fetchTechNews(category, 20);
    renderNewsCards(grid, newsData);
    updateStats();
  } catch (err) {
    grid.innerHTML = renderEmptyState('📰', 'Unable to load news. Check your connection.');
  }
}

async function loadCloud(provider = 'all') {
  const grid = $('cloudGrid');
  renderSkeletons(grid, 6);

  try {
    cloudData = await fetchCloudUpdates(provider, 15);
    renderNewsCards(grid, cloudData, true);
    updateStats();
  } catch (err) {
    grid.innerHTML = renderEmptyState('☁️', 'Unable to load cloud updates.');
  }
}

async function loadTrending() {
  const grid = $('trendingGrid');
  renderSkeletons(grid, 6, 'skeleton-trending');

  try {
    trendingData = await fetchTrending(10);
    renderTrendingCards(grid, trendingData);
    updateStats();
  } catch (err) {
    grid.innerHTML = renderEmptyState('📈', 'Unable to load trending topics.');
  }
}

async function loadRecommendations() {
  const grid = $('recommendationsGrid');
  renderSkeletons(grid, 4, 'skeleton-rec');

  try {
    recommendationsData = await fetchRecommendations(8);
    renderRecommendationCards(grid, recommendationsData);
  } catch (err) {
    grid.innerHTML = renderEmptyState('🎓', 'Unable to load recommendations.');
  }
}

async function handleSearch(query) {
  const grid = $('searchGrid');
  if (!query || query.trim().length < 2) {
    grid.innerHTML = renderEmptyState('🔍', 'Type a keyword to search for technology news');
    return;
  }

  renderSkeletons(grid, 3);

  try {
    const results = await searchNews(query.trim(), 10);
    renderNewsCards(grid, results);
  } catch (err) {
    grid.innerHTML = renderEmptyState('🔍', 'Search failed. Please try again.');
  }
}

// ===========================
// Bookmarks
// ===========================
function toggleBookmark(article) {
  const idx = bookmarks.findIndex((b) => b.id === article.id);
  if (idx === -1) {
    bookmarks.push(article);
    showToast('Saved to bookmarks 🔖');
  } else {
    bookmarks.splice(idx, 1);
    showToast('Removed from bookmarks');
  }
  localStorage.setItem('tp-bookmarks', JSON.stringify(bookmarks));

  // Update bookmark count badge
  updateBookmarkBadge();

  // Re-render bookmarks tab if active
  if (currentTab === 'bookmarks') renderBookmarksTab();
}

function isBookmarked(id) {
  return bookmarks.some((b) => b.id === id);
}

function updateBookmarkBadge() {
  const badge = $('bookmarkBadge');
  if (badge) {
    badge.textContent = bookmarks.length || '';
    badge.style.display = bookmarks.length ? 'inline-flex' : 'none';
  }
}

function renderBookmarksTab() {
  const grid = $('bookmarksGrid');
  if (!grid) return;
  if (bookmarks.length === 0) {
    grid.innerHTML = renderEmptyState('🔖', 'No saved articles yet. Click the bookmark icon on any article!');
    return;
  }
  renderNewsCards(grid, bookmarks);
}

// ===========================
// Rendering — News Cards
// ===========================
function renderNewsCards(container, articles, showProvider = false) {
  if (!articles || articles.length === 0) {
    container.innerHTML = renderEmptyState('📭', 'No articles found');
    return;
  }

  const cardsHtml = articles
    .map((article, i) => {
      const badgeClass = getCategoryBadgeClass(article.category);
      const badgeLabel = getCategoryLabel(article.category);
      const providerBadge = showProvider && article.provider
        ? `<span class="card-provider ${getProviderClass(article.provider)}">${article.provider.toUpperCase()}</span>`
        : '';
      const bookmarked = isBookmarked(article.id);

      return `
        <article class="news-card" style="animation-delay: ${i * 60}ms"
                 data-url="${encodeURIComponent(article.url)}" data-id="${article.id}">
          ${article.imageUrl
            ? `<img class="card-image" src="${article.imageUrl}" alt="${truncate(article.title, 60)}" loading="lazy" onerror="this.outerHTML='<div class=card-image-placeholder></div>'" />`
            : '<div class="card-image-placeholder"></div>'
          }
          <div class="card-body">
            <div class="card-meta">
              <span class="card-source">${article.source}</span>
              <span class="card-time">${timeAgo(article.publishedAt)}</span>
            </div>
            <h3 class="card-title">${article.title}</h3>
            <p class="card-description">${truncate(article.description, 160)}</p>
            ${article.summary && article.summary !== article.description ? `
              <details class="card-summary">
                <summary>View Summary</summary>
                <div class="summary-content">${article.summary.replace(/\\n/g, '<br/>')}</div>
              </details>
            ` : ''}
            <div class="card-footer">
              <span class="category-badge ${badgeClass}">${badgeLabel}</span>
              ${providerBadge}
              <div class="card-actions">
                <button class="bookmark-btn ${bookmarked ? 'bookmarked' : ''}"
                        data-article='${JSON.stringify({ id: article.id, title: article.title, description: article.description, source: article.source, url: article.url, imageUrl: article.imageUrl, publishedAt: article.publishedAt, category: article.category, provider: article.provider }).replace(/'/g, "&#39;")}'
                        title="${bookmarked ? 'Remove bookmark' : 'Save for later'}">
                  ${bookmarked ? '🔖' : '🏷️'}
                </button>
                <span class="card-link">Read more →</span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  // Use event delegation — safe, no inline onclick with URLs
  container.innerHTML = cardsHtml;

  container.addEventListener('click', (e) => {
    // Prevent the card from opening the external link when interacting with the summary
    if (e.target.closest('.card-summary')) {
      return;
    }

    const bookmarkBtn = e.target.closest('.bookmark-btn');
    if (bookmarkBtn) {
      e.stopPropagation();
      try {
        const article = JSON.parse(bookmarkBtn.dataset.article.replace(/&#39;/g, "'"));
        toggleBookmark(article);

        const isNowBookmarked = isBookmarked(article.id);
        bookmarkBtn.classList.toggle('bookmarked', isNowBookmarked);
        bookmarkBtn.textContent = isNowBookmarked ? '🔖' : '🏷️';
        bookmarkBtn.title = isNowBookmarked ? 'Remove bookmark' : 'Save for later';
      } catch (_) {}
      return;
    }

    const card = e.target.closest('.news-card');
    if (card && card.dataset.url) {
      window.open(decodeURIComponent(card.dataset.url), '_blank', 'noopener,noreferrer');
    }
  }, { once: false });
}

// ===========================
// Rendering — Trending Cards
// ===========================
function renderTrendingCards(container, topics) {
  if (!topics || topics.length === 0) {
    container.innerHTML = renderEmptyState('📈', 'No trending data available');
    return;
  }

  container.innerHTML = topics
    .map((topic, i) => {
      const badgeClass = getCategoryBadgeClass(topic.category);
      const articles = topic.relatedArticles || [];

      return `
        <div class="trending-card" style="animation-delay: ${i * 80}ms">
          <div class="trending-header">
            <span class="trending-rank">#${i + 1}</span>
            <span class="trending-count">📰 ${topic.count} articles</span>
          </div>
          <div class="trending-keyword">${topic.keyword}</div>
          <span class="category-badge ${badgeClass}" style="margin-bottom: 12px; display: inline-flex;">
            ${getCategoryLabel(topic.category)}
          </span>
          ${articles.length > 0 ? `
            <ul class="trending-articles">
              ${articles.map((a) => `<li>• ${truncate(a, 80)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    })
    .join('');
}

// ===========================
// Rendering — Recommendation Cards
// ===========================
function renderRecommendationCards(container, recs) {
  if (!recs || recs.length === 0) {
    container.innerHTML = renderEmptyState('🎓', 'No recommendations available');
    return;
  }

  container.innerHTML = recs
    .map((rec, i) => {
      const demandClass = getDemandClass(rec.demandLevel);
      const demandLabel = getDemandLabel(rec.demandLevel);

      const resourcesList = (rec.resources || [])
        .map((r) => `
          <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="rec-resource">
            <span class="rec-resource-name">${r.name}</span>
            <span class="rec-resource-meta">
              <span class="rec-type">${r.type}</span>
              ${r.free ? '<span class="rec-free">FREE</span>' : ''}
            </span>
          </a>
        `)
        .join('');

      const jobTags = (rec.relatedJobTitles || [])
        .map((j) => `<span class="rec-job-tag">${j}</span>`)
        .join('');

      return `
        <div class="rec-card" style="animation-delay: ${i * 100}ms">
          <div class="rec-header">
            <span class="rec-topic">${rec.topic}</span>
            <span class="demand-badge ${demandClass}">${demandLabel}</span>
          </div>
          <p class="rec-description">${rec.description}</p>
          <div class="rec-why">💡 ${rec.whyLearn}</div>

          <div class="rec-section-title">📚 Learning Resources</div>
          <div class="rec-resources">${resourcesList}</div>

          <div class="rec-section-title">💼 Related Careers</div>
          <div class="rec-jobs">${jobTags}</div>

          <div class="rec-salary">💰 ${rec.avgSalaryRange}</div>
        </div>
      `;
    })
    .join('');
}

// ===========================
// Empty State
// ===========================
function renderEmptyState(icon, text) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <p class="empty-state-text">${text}</p>
    </div>
  `;
}

// ===========================
// Toast Notification
// ===========================
function showToast(message, duration = 2500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===========================
// Stats
// ===========================
function updateStats() {
  $('totalArticles').textContent = newsData.length || '—';
  $('cloudCount').textContent = cloudData.length || '—';

  if (trendingData.length > 0) {
    $('topTrending').textContent = trendingData[0].keyword;
    // Use category label map instead of regex
    const categoryLabels = { ai: 'AI/ML', cloud: 'Cloud', security: 'Security', devops: 'DevOps', data: 'Data', technology: 'Tech' };
    $('topCategory').textContent = categoryLabels[trendingData[0].category] || '—';
  }
}

// ===========================
// Filters
// ===========================
function initFilters() {
  $('categoryFilter')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    const category = btn.dataset.category;
    $$('#categoryFilter .pill').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    newsData = [];
    loadNews(category);
  });

  $('cloudFilter')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    const provider = btn.dataset.provider;
    $$('#cloudFilter .pill').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    cloudData = [];
    loadCloud(provider);
  });
}

// ===========================
// Search
// ===========================
function initSearch() {
  const input = $('searchInput');
  const debouncedSearch = debounce(handleSearch, 500);

  input?.addEventListener('input', (e) => debouncedSearch(e.target.value));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch(e.target.value);
  });

  $$('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      if (input) input.value = query;
      handleSearch(query);
    });
  });
}

// ===========================
// Auto-Refresh (every 15 min)
// ===========================
function initAutoRefresh() {
  const INTERVAL_MS = 15 * 60 * 1000;

  autoRefreshTimer = setInterval(async () => {
    // Silent refresh — don't show skeleton, just update data
    try {
      const [freshNews, freshTrending] = await Promise.all([
        fetchTechNews('all', 20),
        fetchTrending(10),
      ]);

      const hasNewArticles = freshNews.length > 0 &&
        (newsData.length === 0 || freshNews[0]?.id !== newsData[0]?.id);

      newsData = freshNews;
      trendingData = freshTrending;

      if (hasNewArticles && currentTab === 'news') {
        renderNewsCards($('newsGrid'), newsData);
      }

      updateStats();
      $('lastUpdated').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      if (hasNewArticles) {
        showToast('🔄 News refreshed with latest updates');
      }
    } catch (_) {
      // Silent fail on auto-refresh
    }
  }, INTERVAL_MS);
}

// ===========================
// Manual Refresh Button
// ===========================
function initRefresh() {
  $('refreshBtn')?.addEventListener('click', async () => {
    const btn = $('refreshBtn');
    btn.classList.add('spinning');

    newsData = [];
    cloudData = [];
    trendingData = [];
    recommendationsData = [];

    await loadTabData(currentTab);

    btn.classList.remove('spinning');
    $('lastUpdated').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    showToast('✅ Data refreshed!');
  });
}

// ===========================
// Last Updated Timer
// ===========================
function initLastUpdatedTimer() {
  $('lastUpdated').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// ===========================
// Initialize App
// ===========================
async function init() {
  initTheme();
  initTabs();
  initFilters();
  initSearch();
  initRefresh();
  initAutoRefresh();
  initLastUpdatedTimer();
  updateBookmarkBadge();

  // Load initial data in parallel
  await Promise.all([
    loadNews(),
    loadTrending(),
  ]);
}

init();
