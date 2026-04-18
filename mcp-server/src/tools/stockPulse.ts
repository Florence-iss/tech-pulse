export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const BASE_STOCKS: Record<string, { name: string; basePrice: number }> = {
  AAPL: { name: "Apple Inc.", basePrice: 173.5 },
  MSFT: { name: "Microsoft Corp.", basePrice: 420.2 },
  GOOGL: { name: "Alphabet Inc.", basePrice: 155.8 },
  META: { name: "Meta Platforms", basePrice: 512.4 },
  AMZN: { name: "Amazon.com", basePrice: 178.1 },
  NVDA: { name: "NVIDIA Corp.", basePrice: 880.0 },
  TSLA: { name: "Tesla Inc.", basePrice: 175.2 },
};

/**
 * Returns highly realistic simulated market data for top tech companies.
 * We use simulation to avoid strict rate limits on free financial APIs,
 * ensuring the UI dashboard remains fully operational.
 */
export async function getStockPulse(): Promise<StockData[]> {
  // Simulate network delay to act like a real API
  await new Promise((resolve) => setTimeout(resolve, 300));

  return Object.entries(BASE_STOCKS).map(([symbol, info]) => {
    // Generate realistic daily fluctuations (-3% to +3%)
    const fluctuationPercent = (Math.random() * 6 - 3); 
    const change = (info.basePrice * fluctuationPercent) / 100;
    const currentPrice = info.basePrice + change;

    return {
      symbol,
      name: info.name,
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(fluctuationPercent.toFixed(2)),
    };
  });
}
