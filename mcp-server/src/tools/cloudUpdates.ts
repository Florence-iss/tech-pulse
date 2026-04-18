import RssParser from "rss-parser";
import type { Article } from "../types.js";

const parser = new RssParser({
  timeout: 10000,
  headers: {
    "User-Agent": "TechPulse/1.0 (News Aggregator)",
  },
});

interface FeedConfig {
  url: string;
  provider: string;
  color: string;
}

const CLOUD_FEEDS: Record<string, FeedConfig[]> = {
  aws: [
    {
      url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
      provider: "AWS",
      color: "#ff9900",
    },
    {
      url: "https://aws.amazon.com/blogs/aws/feed/",
      provider: "AWS",
      color: "#ff9900",
    },
  ],
  azure: [
    {
      url: "https://azure.microsoft.com/en-us/blog/feed/",
      provider: "Azure",
      color: "#0078d4",
    },
  ],
  gcp: [
    {
      url: "https://cloud.google.com/feeds/gcp-release-notes.xml",
      provider: "GCP",
      color: "#4285f4",
    },
    {
      url: "https://developers.googleblog.com/feeds/posts/default/-/Cloud",
      provider: "GCP",
      color: "#4285f4",
    },
  ],
};

function generateId(title: string, source: string): string {
  const hash = (title + source).split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return Math.abs(hash).toString(36);
}

async function parseFeed(config: FeedConfig, maxResults: number): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(config.url);
    const items = feed.items.slice(0, maxResults);

    return items.map((item) => ({
      id: generateId(item.title || "", config.provider),
      title: item.title || "Untitled",
      description: (item.contentSnippet || item.content || "").slice(0, 300),
      summary: item.content || item.contentSnippet || "",
      source: config.provider,
      url: item.link || config.url,
      imageUrl: item.enclosure?.url || null,
      publishedAt: item.isoDate || new Date().toISOString(),
      category: "cloud",
      provider: config.provider.toLowerCase(),
    }));
  } catch (error) {
    console.error(`Failed to parse feed ${config.url}:`, error);
    return [];
  }
}

export async function fetchCloudUpdates(
  provider: string,
  maxResults: number
): Promise<Article[]> {
  let feeds: FeedConfig[] = [];

  if (provider === "all") {
    feeds = Object.values(CLOUD_FEEDS).flat();
  } else if (CLOUD_FEEDS[provider]) {
    feeds = CLOUD_FEEDS[provider];
  } else {
    return getSampleCloudUpdates(provider);
  }

  const results = await Promise.allSettled(
    feeds.map((feed) => parseFeed(feed, Math.ceil(maxResults / feeds.length)))
  );

  const articles = results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  if (articles.length === 0) {
    return getSampleCloudUpdates(provider);
  }

  // Sort by date, newest first
  articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return articles.slice(0, maxResults);
}

function getSampleCloudUpdates(provider: string): Article[] {
  const now = new Date().toISOString();
  const samples: Article[] = [
    {
      id: "cloud1",
      title: "Amazon Bedrock Now Supports Claude 4 Model Family",
      description: "AWS announces general availability of Anthropic's Claude 4 models on Amazon Bedrock, enabling enterprises to build advanced AI applications with enhanced reasoning capabilities.",
      source: "AWS",
      url: "https://aws.amazon.com/about-aws/whats-new/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      provider: "aws",
    },
    {
      id: "cloud2",
      title: "Azure AI Studio Introduces Real-Time Model Fine-Tuning",
      description: "Microsoft Azure launches a new capability in AI Studio that allows developers to fine-tune foundation models in real-time with streaming data pipelines.",
      source: "Azure",
      url: "https://azure.microsoft.com/en-us/blog/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      provider: "azure",
    },
    {
      id: "cloud3",
      title: "Google Cloud Introduces Distributed Cloud Connected Edge",
      description: "GCP expands its distributed cloud offering with new edge computing locations, bringing Google Cloud services closer to enterprise data centers worldwide.",
      source: "GCP",
      url: "https://cloud.google.com/blog/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      provider: "gcp",
    },
    {
      id: "cloud4",
      title: "AWS Lambda Adds Native Support for .NET 9",
      description: "AWS Lambda now supports .NET 9 managed runtime with improved cold start performance and AOT compilation support for serverless functions.",
      source: "AWS",
      url: "https://aws.amazon.com/about-aws/whats-new/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      provider: "aws",
    },
    {
      id: "cloud5",
      title: "Azure Kubernetes Service Introduces Automatic Node Repair",
      description: "AKS now automatically detects and repairs unhealthy nodes, reducing operational overhead for Kubernetes cluster management in production environments.",
      source: "Azure",
      url: "https://azure.microsoft.com/en-us/blog/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      provider: "azure",
    },
    {
      id: "cloud6",
      title: "Google Cloud Spanner Adds PostgreSQL Interface Compatibility",
      description: "Cloud Spanner now offers full PostgreSQL wire protocol compatibility, making it easier for teams to migrate existing PostgreSQL workloads to a globally distributed database.",
      source: "GCP",
      url: "https://cloud.google.com/blog/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      provider: "gcp",
    },
  ];

  if (provider === "all") return samples;
  return samples.filter((s) => s.provider === provider);
}
