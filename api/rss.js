// package.json deps: { "rss-parser": "^3.13.0" }
import Parser from "rss-parser";

export default async function handler(req, res) {
  const url = (req.query.url || "").trim();
  if (!url) {
    res.status(400).json({ error: "Missing ?url=" });
    return;
  }

  try {
    const parser = new Parser({
      timeout: 15000,
      headers: { "User-Agent": "Ksenia-RSS-Reader/1.0" }
    });
    const feed = await parser.parseURL(url);

    // Normalize a compact JSON shape for your frontend
    const data = {
      title: feed.title || "",
      link: feed.link || url,
      lastBuildDate: feed.lastBuildDate || feed.pubDate || null,
      items: (feed.items || []).slice(0, 50).map(i => ({
        title: i.title || "",
        link: i.link || "",
        isoDate: i.isoDate || i.pubDate || null,
        author: i.creator || i.author || null,
        categories: i.categories || [],
        summary: i.contentSnippet || null
      }))
    };

    // CORS + caching
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=86400");
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: "Fetch/parse failed", detail: String(err) });
  }
}
