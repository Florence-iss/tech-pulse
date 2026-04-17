import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let client = null;
let isConnected = false;

export async function getMcpClient() {
  if (isConnected && client) return client;

  try {
    const mcpServerPath = resolve(__dirname, "../mcp-server/build/index.js");

    const transport = new StdioClientTransport({
      command: "node",
      args: [mcpServerPath],
      env: {
        ...process.env,
        GNEWS_API_KEY: process.env.GNEWS_API_KEY || "",
      },
    });

    client = new Client({
      name: "tech-pulse-api",
      version: "1.0.0",
    });

    await client.connect(transport);
    isConnected = true;
    console.log("✅ Connected to MCP server");
    return client;
  } catch (error) {
    console.error("❌ Failed to connect to MCP server:", error.message);
    isConnected = false;
    client = null;
    throw error;
  }
}

export async function callMcpTool(toolName, args = {}) {
  try {
    const mcpClient = await getMcpClient();
    const result = await mcpClient.callTool({
      name: toolName,
      arguments: args,
    });

    // Parse the text content from MCP response
    const textContent = result.content?.find((c) => c.type === "text");
    if (textContent) {
      return JSON.parse(textContent.text);
    }
    return [];
  } catch (error) {
    console.error(`MCP tool "${toolName}" error:`, error.message);
    // If MCP connection fails, try reconnecting once
    if (!isConnected) {
      isConnected = false;
      client = null;
      try {
        const mcpClient = await getMcpClient();
        const result = await mcpClient.callTool({
          name: toolName,
          arguments: args,
        });
        const textContent = result.content?.find((c) => c.type === "text");
        if (textContent) return JSON.parse(textContent.text);
      } catch (retryError) {
        console.error("Retry failed:", retryError.message);
      }
    }
    throw error;
  }
}
