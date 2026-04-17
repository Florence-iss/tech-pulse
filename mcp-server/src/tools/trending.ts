import type { TrendingTopic } from "../types.js";
import { fetchTechNews } from "./techNews.js";

// Technology keywords to track
const TECH_KEYWORDS: Record<string, string> = {
  "artificial intelligence": "ai",
  "machine learning": "ai",
  "deep learning": "ai",
  "generative ai": "ai",
  "large language model": "ai",
  "llm": "ai",
  "gpt": "ai",
  "claude": "ai",
  "gemini": "ai",
  "copilot": "ai",
  "kubernetes": "devops",
  "docker": "devops",
  "terraform": "devops",
  "ci/cd": "devops",
  "devops": "devops",
  "github actions": "devops",
  "aws": "cloud",
  "azure": "cloud",
  "google cloud": "cloud",
  "serverless": "cloud",
  "cloud native": "cloud",
  "multi-cloud": "cloud",
  "edge computing": "cloud",
  "cybersecurity": "security",
  "zero trust": "security",
  "ransomware": "security",
  "data breach": "security",
  "encryption": "security",
  "soc": "security",
  "data engineering": "data",
  "data science": "data",
  "big data": "data",
  "data pipeline": "data",
  "apache spark": "data",
  "apache kafka": "data",
  "snowflake": "data",
  "databricks": "data",
  "power bi": "data",
  "etl": "data",
  "data lake": "data",
  "analytics": "data",
  "rust": "technology",
  "python": "technology",
  "typescript": "technology",
  "golang": "technology",
  "react": "technology",
  "next.js": "technology",
  "blockchain": "technology",
  "web3": "technology",
  "quantum computing": "technology",
  "5g": "technology",
  "iot": "technology",
};

export async function getTrending(limit: number): Promise<TrendingTopic[]> {
  // Fetch latest articles to analyze
  const articles = await fetchTechNews("all", 50);

  // Count keyword occurrences
  const keywordCounts = new Map<string, { count: number; category: string; articles: string[] }>();

  for (const article of articles) {
    const text = `${article.title} ${article.description}`.toLowerCase();

    for (const [keyword, category] of Object.entries(TECH_KEYWORDS)) {
      if (text.includes(keyword.toLowerCase())) {
        const existing = keywordCounts.get(keyword) || {
          count: 0,
          category,
          articles: [],
        };
        existing.count++;
        if (existing.articles.length < 3) {
          existing.articles.push(article.title);
        }
        keywordCounts.set(keyword, existing);
      }
    }
  }

  // Sort by count and return top results
  const trending: TrendingTopic[] = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([keyword, data]) => ({
      keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
      count: data.count,
      category: data.category,
      relatedArticles: data.articles,
    }));

  // If not enough data, add static trending topics
  if (trending.length < limit) {
    const staticTrending: TrendingTopic[] = [
      { keyword: "Artificial Intelligence", count: 42, category: "ai", relatedArticles: ["AI Agents Transform Software Development"] },
      { keyword: "Kubernetes", count: 28, category: "devops", relatedArticles: ["K8s 1.33 Released with Enhanced Security"] },
      { keyword: "Cloud Native", count: 25, category: "cloud", relatedArticles: ["Multi-Cloud Adoption Reaches 93%"] },
      { keyword: "Cybersecurity", count: 22, category: "security", relatedArticles: ["Zero Trust Architecture Becomes Default"] },
      { keyword: "Rust", count: 18, category: "technology", relatedArticles: ["Rust Overtakes Go as Most Desired Language"] },
      { keyword: "Serverless", count: 16, category: "cloud", relatedArticles: ["AWS Lambda Adds .NET 9 Support"] },
      { keyword: "Terraform", count: 14, category: "devops", relatedArticles: ["Terraform 2.0 Preview with AI Planning"] },
      { keyword: "Python", count: 13, category: "technology", relatedArticles: ["Python Dominates Data Science Tooling"] },
      { keyword: "TypeScript", count: 12, category: "technology", relatedArticles: ["TypeScript 6.0 Performance Improvements"] },
      { keyword: "Zero Trust", count: 11, category: "security", relatedArticles: ["Federal Zero Trust Mandate 2027"] },
    ];

    for (const t of staticTrending) {
      if (trending.length >= limit) break;
      if (!trending.find((x) => x.keyword.toLowerCase() === t.keyword.toLowerCase())) {
        trending.push(t);
      }
    }
  }

  return trending.slice(0, limit);
}
