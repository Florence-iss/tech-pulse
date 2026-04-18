export interface CompanyResearch {
  name: string;
  extract: string;
  thumbnail: string | null;
  url: string;
}

/**
 * Uses the free, public Wikipedia API to get a deep-dive summary and dossier
 * on a technology firm or related query.
 */
export async function getCompanyIntelligence(query: string): Promise<CompanyResearch> {
  // 1. Search Wikipedia to get the exact page title
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
  
  try {
    const searchRes = await fetch(searchUrl);
    const searchData: any = await searchRes.json();
    
    if (!searchData.query.search || searchData.query.search.length === 0) {
      throw new Error("Company not found.");
    }
    
    const pageTitle = searchData.query.search[0].title;
    
    // 2. Fetch the summary overview (extract) and thumbnail from the exact page
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&titles=${encodeURIComponent(pageTitle)}&pithumbsize=600&format=json&origin=*`;
    
    const detailRes = await fetch(detailUrl);
    const detailData: any = await detailRes.json();
    
    const pages = detailData.query.pages;
    const pageId = Object.keys(pages)[0];
    const pageInfo = pages[pageId];
    
    return {
      name: pageInfo.title,
      extract: pageInfo.extract || "No overview available.",
      thumbnail: pageInfo.thumbnail ? pageInfo.thumbnail.source : null,
      url: `https://en.wikipedia.org/?curid=${pageId}`,
    };
  } catch (error) {
    console.error("Wikipedia API fetch error:", error);
    // Fallback Mock output so UI doesn't crash if Wiki is blocked
    return {
      name: query,
      extract: `Intelligence briefing for ${query} is currently unavailable. Ensure the company is publicly listed and known within the technology sector.`,
      thumbnail: null,
      url: "#",
    };
  }
}
