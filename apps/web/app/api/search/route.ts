import { NextRequest, NextResponse } from "next/server";

// Upload image to uguu.se (free anonymous image hosting, works globally)
async function uploadToTempHost(arrayBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([arrayBuffer], { type: mimeType });
  formData.append("files[]", blob, "image.jpg");

  const res = await fetch("https://uguu.se/upload.php", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  if (data.success && data.files && data.files[0]) {
    return data.files[0].url;
  }
  throw new Error("Upload succeeded but no URL returned in response");
}

// Query SerpApi Google Lens
async function searchGoogleLens(imageUrl: string, apiKey: string) {
  const params = new URLSearchParams({
    engine: "google_lens",
    url: imageUrl,
    api_key: apiKey,
  });

  const res = await fetch(`https://serpapi.com/search?${params.toString()}`);
  if (!res.ok) throw new Error(`SerpApi error: ${res.status}`);
  const data = await res.json();
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return NextResponse.json({
        found: false,
        message: "Reverse image search is not configured. Set SERPAPI_KEY in environment variables.",
        candidates: [],
      });
    }

    // Upload image to temporary public host
    const arrayBuffer = await file.arrayBuffer();
    let imageUrl: string;
    try {
      imageUrl = await uploadToTempHost(arrayBuffer, file.type || "image/jpeg");
    } catch (e: any) {
      return NextResponse.json({
        found: false,
        message: "Could not upload image for search: " + e.message,
        candidates: [],
      });
    }

    // Query SerpApi Google Lens
    const lensData = await searchGoogleLens(imageUrl, apiKey);

    // Extract visual matches from response
    const visualMatches: any[] = lensData.visual_matches || [];
    const knowledgeGraph = lensData.knowledge_graph;

    if (visualMatches.length === 0 && !knowledgeGraph) {
      return NextResponse.json({
        found: false,
        message: "No public matches found for this image.",
        candidates: [],
        searchedUrl: imageUrl,
      });
    }

    // Map results to our format
    const candidates = visualMatches.slice(0, 6).map((match: any) => ({
      title: match.title || "Untitled",
      domain: match.source || match.link ? new URL(match.link || "https://unknown.com").hostname : "unknown",
      sourceType: "Web",
      candidateUrl: match.link || "#",
      imageUrl: match.thumbnail || match.image_url || null,
      matchScore: match.score ? parseFloat((match.score / 100).toFixed(2)) : null,
      position: match.position,
    }));

    return NextResponse.json({
      found: true,
      candidates,
      totalResults: visualMatches.length,
      searchedUrl: imageUrl,
      knowledgeGraph: knowledgeGraph
        ? {
            title: knowledgeGraph.title,
            type: knowledgeGraph.type,
            description: knowledgeGraph.description,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Search failed: " + err.message, found: false, candidates: [] },
      { status: 500 }
    );
  }
}
