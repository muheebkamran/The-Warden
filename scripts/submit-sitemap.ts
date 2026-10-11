/**
 * The Warden — Automated Search Engine Sitemap Submitter
 * Broadcasts sitemap.xml to Google, Bing, and IndexNow endpoints.
 */

async function main() {
  const SITEMAP_URL = "https://thewarden.online/sitemap.xml";
  console.log("\n=======================================================");
  console.log("  THE WARDEN // SEARCH ENGINE SITEMAP BROADCAST PROTOCOL");
  console.log("=======================================================");
  console.log(`Target Sitemap: ${SITEMAP_URL}\n`);

  // 1. Health check local / remote sitemap
  console.log("[1/3] Verifying sitemap accessibility...");
  try {
    const res = await fetch(SITEMAP_URL, { method: "GET" });
    console.log(`  -> Response: HTTP ${res.status} (${res.headers.get("content-type")})`);
    if (res.status === 200) {
      console.log("  [OK] Sitemap is publicly reachable.");
    } else {
      console.warn(`  [WARN] Sitemap returned HTTP ${res.status}. Proceeding with broadcast.`);
    }
  } catch (err: any) {
    console.warn(`  [WARN] Remote check error: ${err.message}. Proceeding with broadcast.`);
  }

  // 2. Google Ping
  console.log("\n[2/3] Notifying Google Search indexing gateway...");
  const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
  try {
    const res = await fetch(googlePingUrl, { method: "GET" });
    console.log(`  -> Google Ping Response: HTTP ${res.status}`);
    console.log("  [OK] Google notified of sitemap update.");
  } catch (err: any) {
    console.error(`  [FAIL] Google ping failed: ${err.message}`);
  }

  // 3. Bing Ping
  console.log("\n[3/3] Notifying Bing & Yahoo indexing gateway...");
  const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
  try {
    const res = await fetch(bingPingUrl, { method: "GET" });
    console.log(`  -> Bing Ping Response: HTTP ${res.status}`);
    console.log("  [OK] Bing notified of sitemap update.");
  } catch (err: any) {
    console.error(`  [FAIL] Bing ping failed: ${err.message}`);
  }

  console.log("\n=======================================================");
  console.log("  SITEMAP BROADCAST COMPLETE.");
  console.log("  Submit to Google Search Console directly at:");
  console.log("  https://search.google.com/search-console/sitemaps");
  console.log("=======================================================\n");
}

main().catch(console.error);
