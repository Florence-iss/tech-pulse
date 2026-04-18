export interface Article {
  id: string;
  title: string;
  description: string;
  summary?: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  category: string;
  provider?: string;
}

export interface TrendingTopic {
  keyword: string;
  count: number;
  category: string;
  relatedArticles: string[];
}

export interface Recommendation {
  topic: string;
  demandLevel: "high" | "very-high" | "critical";
  category: string;
  description: string;
  whyLearn: string;
  resources: {
    name: string;
    url: string;
    type: "course" | "docs" | "tutorial" | "certification";
    free: boolean;
  }[];
  relatedJobTitles: string[];
  avgSalaryRange: string;
  articleCount: number;
}

// GNews API response types
export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}
