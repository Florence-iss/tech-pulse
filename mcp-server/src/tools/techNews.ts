import type { Article, GNewsResponse } from "../types.js";

const GNEWS_BASE_URL = "https://gnews.io/api/v4";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ai: ["artificial intelligence", "machine learning", "deep learning", "LLM", "GPT", "neural network", "generative AI"],
  cloud: ["cloud computing", "AWS", "Azure", "Google Cloud", "serverless", "kubernetes", "docker"],
  security: ["cybersecurity", "data breach", "ransomware", "zero trust", "encryption", "vulnerability"],
  devops: ["DevOps", "CI/CD", "infrastructure as code", "terraform", "ansible", "jenkins", "GitHub Actions"],
  data: ["data engineering", "data science", "big data", "data pipeline", "data lake", "data warehouse", "ETL", "Apache Spark", "Apache Kafka", "Snowflake", "Databricks", "Power BI", "Tableau", "analytics"],
  technology: ["software development", "programming", "technology", "digital transformation"],
};

function generateId(title: string, source: string): string {
  const hash = (title + source).split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return Math.abs(hash).toString(36);
}

function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  return "technology";
}

async function fetchFromGNews(
  query: string,
  maxResults: number
): Promise<Article[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error("Warning: GNEWS_API_KEY not set, returning sample data");
    return getSampleTechNews();
  }

  try {
    const url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&max=${maxResults}&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`GNews API error: ${response.status}`);
      return getSampleTechNews();
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
      category: categorizeArticle(article.title, article.description || ""),
    }));
  } catch (error) {
    console.error("GNews fetch error:", error);
    return getSampleTechNews();
  }
}

export async function fetchTechNews(
  category: string,
  maxResults: number
): Promise<Article[]> {
  let query: string;

  if (category === "all") {
    query = "technology OR artificial intelligence OR cloud computing OR cybersecurity OR DevOps";
  } else {
    const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS["technology"];
    query = keywords.slice(0, 3).join(" OR ");
  }

  const articles = await fetchFromGNews(query, maxResults);

  if (category !== "all") {
    return articles.filter((a) => a.category === category || category === "technology");
  }

  return articles;
}

function getSampleTechNews(): Article[] {
  const now = new Date().toISOString();
  return [
    {
      id: "sample1",
      title: "AI Agents Are Transforming Enterprise Software Development",
      description: "Major tech companies are racing to deploy AI-powered coding agents that can autonomously write, test, and deploy code, fundamentally reshaping how software teams operate.",
      source: "TechCrunch",
      url: "https://techcrunch.com",
      imageUrl: null,
      publishedAt: now,
      category: "ai",
      summary: "Major tech companies are racing to deploy AI-powered coding agents that can autonomously write, test, and deploy code, fundamentally reshaping how software teams operate. This shift represents a major paradigm change in dev tools, as code creation becomes more automated and error-resistant.",
    },
    {
      id: "sample2",
      title: "Kubernetes 1.33 Released with Enhanced Security Features",
      description: "The latest Kubernetes release introduces sidecar containers GA, improved pod security standards, and native support for confidential computing workloads.",
      source: "The New Stack",
      url: "https://thenewstack.io",
      imageUrl: null,
      publishedAt: now,
      category: "devops",
      summary: "The latest Kubernetes release introduces sidecar containers GA, improved pod security standards, and native support for confidential computing workloads. These enhancements drastically lower the overhead of operating complex microservices architectures securely at a large scale.",
    },
    {
      id: "sample3",
      title: "AWS Announces Next-Gen Graviton5 Processors for Cloud Workloads",
      description: "Amazon Web Services unveils Graviton5 chips promising 40% better price-performance for compute-intensive cloud applications and AI inference tasks.",
      source: "AWS News",
      url: "https://aws.amazon.com/blogs/aws/",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      summary: "Amazon Web Services unveils Graviton5 chips promising 40% better price-performance for compute-intensive cloud applications and AI inference tasks. With native support for DDR6 memory, customers can expect faster model deployment times and reduced operating expenditures.",
    },
    {
      id: "sample4",
      title: "Zero Trust Architecture Becomes Default for Government Agencies",
      description: "Federal mandate requires all government agencies to implement zero trust network architecture by 2027, driving massive demand for cybersecurity professionals.",
      source: "Dark Reading",
      url: "https://darkreading.com",
      imageUrl: null,
      publishedAt: now,
      category: "security",
      summary: "Federal mandate requires all government agencies to implement zero trust network architecture by 2027, driving massive demand for cybersecurity professionals. Vendors are pivoting aggressively to offer seamlessly integrated zero-trust tools that replace legacy VPNs.",
    },
    {
      id: "sample5",
      title: "Terraform 2.0 Preview: Infrastructure as Code Gets AI-Powered Planning",
      description: "HashiCorp previews Terraform 2.0 with intelligent resource planning, automated drift detection, and AI-suggested infrastructure optimizations.",
      source: "InfoWorld",
      url: "https://infoworld.com",
      imageUrl: null,
      publishedAt: now,
      category: "devops",
      summary: "HashiCorp previews Terraform 2.0 with intelligent resource planning, automated drift detection, and AI-suggested infrastructure optimizations. The new declarative engine drastically improves state locking synchronization times across globally distributed dev teams.",
    },
    {
      id: "sample6",
      title: "Google DeepMind Achieves Breakthrough in Multi-Modal AI Reasoning",
      description: "New model demonstrates near-human-level reasoning across text, images, video, and code simultaneously, opening doors for advanced AI assistants.",
      source: "MIT Technology Review",
      url: "https://technologyreview.com",
      imageUrl: null,
      publishedAt: now,
      category: "ai",
      summary: "New model demonstrates near-human-level reasoning across text, images, video, and code simultaneously, opening doors for advanced AI assistants. Internal testing shows a 30% jump in contextual awareness over the previous iteration, marking a leap toward AGI methodologies.",
    },
    {
      id: "sample7",
      title: "Multi-Cloud Strategy Adoption Reaches 93% Among Enterprises",
      description: "A new survey reveals that nearly all large enterprises now use at least two cloud providers, with cost optimization and vendor lock-in avoidance as top drivers.",
      source: "Gartner",
      url: "https://gartner.com",
      imageUrl: null,
      publishedAt: now,
      category: "cloud",
      summary: "A new survey reveals that nearly all large enterprises now use at least two cloud providers, with cost optimization and vendor lock-in avoidance as top drivers. The trend accelerates the need for hyper-agnostic deployment patterns such as Kubernetes across hybrid boundaries.",
    },
    {
      id: "sample8",
      title: "Rust Overtakes Go as Most Desired Programming Language in 2026",
      description: "Stack Overflow's annual developer survey shows Rust maintaining top spot for most desired language, with Go falling behind as systems programming evolves.",
      source: "Stack Overflow Blog",
      url: "https://stackoverflow.blog",
      imageUrl: null,
      publishedAt: now,
      category: "technology",
      summary: "Stack Overflow's annual developer survey shows Rust maintaining top spot for most desired language, with Go falling behind as systems programming evolves. Memory safety concerns have pushed enterprise development to rapidly rewrite critical backend C/C++ services into Rust.",
    },
    {
      id: "sample9",
      title: "Apache Spark 4.0 Introduces Native AI Pipeline Integrations",
      description: "The latest monumental release of Apache Spark brings massive speed improvements to big data ETL jobs and offers built-in streaming integrations for training LLMs directly on data lakes.",
      source: "Data Engineering Weekly",
      url: "https://dataengineeringweekly.com",
      imageUrl: null,
      publishedAt: now,
      category: "data",
      summary: "With the release of Apache Spark 4.0, data engineers can now natively orchestrate machine learning pipelines and LLM training over massive data lakes without needing to dump data into intermediate stores. This release drastically cuts down latency and computes costs for complex big data transforms.",
    },
  ];
}
