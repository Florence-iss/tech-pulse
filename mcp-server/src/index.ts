import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchTechNews } from "./tools/techNews.js";
import { fetchCloudUpdates } from "./tools/cloudUpdates.js";
import { searchNews } from "./tools/searchNews.js";
import { getTrending } from "./tools/trending.js";
import { getRecommendations } from "./tools/recommendations.js"; // Import recommendations


const server = new McpServer({
  name: "tech-pulse-news",
  version: "1.0.0",
});

// Tool: Fetch latest high-demand IT industry news
server.tool(
  "fetch_tech_news",
  {
    category: z
      .enum(["technology", "ai", "cloud", "security", "devops", "data", "all"])
      .default("all")
      .describe("News category to fetch"),
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .describe("Maximum number of articles to return"),
  },
  async ({ category, maxResults }) => {
    try {
      const articles = await fetchTechNews(category, maxResults);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(articles, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Fetch cloud provider updates (AWS, Azure, GCP)
server.tool(
  "fetch_cloud_updates",
  {
    provider: z
      .enum(["aws", "azure", "gcp", "all"])
      .default("all")
      .describe("Cloud provider to fetch updates for"),
    maxResults: z
      .number()
      .min(1)
      .max(30)
      .default(15)
      .describe("Maximum results per provider"),
  },
  async ({ provider, maxResults }) => {
    try {
      const updates = await fetchCloudUpdates(provider, maxResults);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(updates, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Search news by keyword
server.tool(
  "search_news",
  {
    query: z.string().describe("Search query keyword"),
    language: z.string().default("en").describe("Language code"),
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum results"),
  },
  async ({ query, language, maxResults }) => {
    try {
      const results = await searchNews(query, language, maxResults);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get trending technology topics
server.tool(
  "get_trending",
  {
    limit: z
      .number()
      .min(5)
      .max(20)
      .default(10)
      .describe("Number of trending topics to return"),
  },
  async ({ limit }) => {
    try {
      const trending = await getTrending(limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(trending, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get learning recommendations based on trending news
server.tool(
  "get_recommendations",
  {
    limit: z
      .number()
      .min(3)
      .max(15)
      .default(6)
      .describe("Number of recommendations to return"),
  },
  async ({ limit }) => {
    try {
      const recommendations = await getRecommendations(limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(recommendations, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Start server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Tech Pulse MCP Server running on stdio");
