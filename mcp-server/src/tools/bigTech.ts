import type { Article, GNewsResponse } from "../types.js";

const GNEWS_BASE_URL = "https://gnews.io/api/v4";

const BIG_TECH_COMPANIES = ["Apple", "Microsoft", "Google", "Meta", "Amazon", "Nvidia", "OpenAI"];

function generateId(title: string, source: string): string {
  const hash = (title + source).split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return Math.abs(hash).toString(36);
}

/**
 * Fallback data if API key is missing or limit reached.
 */
function getSampleBigTechNews(company: string): Article[] {
  const now = new Date().toISOString();
  return [
    {
      id: "bt_sample1",
      title: `${company} Announces Next-Generation AI Infrastructure Deployment`,
      description: `${company} has unveiled its latest datacenter architecture designed to train multimodal models at unprecedented speed.`,
      source: "TechPulse Insider",
      url: "https://example.com/bigtech1",
      imageUrl: null,
      publishedAt: now,
      category: company.toLowerCase(),
      summary: "Industry analysts suggest this latest move will solidify the company's position as a dominant force in enterprise AI services.",
    },
    {
      id: "bt_sample2",
      title: `Shares of ${company} Surge Following Quarterly Earnings Beat`,
      description: `Fueled by strong enterprise demand, ${company} delivered revenues that exceeded Wall Street estimates.`,
      source: "MarketWatch",
      url: "https://example.com/bigtech2",
      imageUrl: null,
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      category: company.toLowerCase(),
      summary: "The unexpected revenue jump was driven primarily by aggressive expansion in their cloud computing division.",
    },
    {
      id: "bt_sample3",
      title: `${company} Acquires Promising Web3 Startup to Boost Ecosystem`,
      description: `In a surprise move, ${company} finalized a $2B acquisition to integrate decentralized tech into its consumer products.`,
      source: "The Verge",
      url: "https://example.com/bigtech3",
      imageUrl: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: company.toLowerCase(),
      summary: "This strategic acquisition signals a pivot away from their traditional hardware focus.",
    }
  ];
}

async function fetchFromGNewsBigTech(
  query: string,
  maxResults: number,
  company: string
): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error("Warning: GNEWS_API_KEY not set for Big Tech, returning sample data");
    return getSampleBigTechNews(company);
  }

  try {
    const url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&max=${maxResults}&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`GNews API error (Big Tech): ${response.status}`);
      return getSampleBigTechNews(company);
    }

    const data = (await response.json()) as GNewsResponse;

    return data.articles.map((article) => ({
      id: generateId(article.title, article.source.name),
      title: article.title,
      description: article.description || "",
      summary: article.content,
      source: article.source.name,
      url: article.url,
      imageUrl: article.image,
      publishedAt: article.publishedAt,
      category: company.toLowerCase(),
    }));
  } catch (error) {
    console.error("GNews Big Tech fetch error:", error);
    return getSampleBigTechNews(company);
  }
}

export async function fetchBigTechNews(
  company: string,
  maxResults: number
): Promise<Article[]> {
  let query: string;

  if (company === "all") {
    query = BIG_TECH_COMPANIES.join(" OR ");
  } else {
    query = `"${company}"`;
  }

  return await fetchFromGNewsBigTech(query, maxResults, company === "all" ? "Big Tech" : company);
}
