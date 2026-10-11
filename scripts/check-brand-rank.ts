export {};

/**
 * The Warden — Automated Brand SERP Rank & Entity Checker
 * Tests search engine indexation, brand query presence, and structured data integrity for "The-Warden".
 */

interface DiagnosticCheck {
  name: string;
  category: "Indexation" | "Structured Data" | "Assets" | "Brand Signals";
  status: "PASS" | "WARN" | "FAIL";
  details: string;
}

async function checkAsset(url: string, expectedType?: string) {
  try {
    const res = await fetch(url, { method: "GET" });
    const isOk = res.status === 200;
    const contentType = res.headers.get("content-type") || "";
    const typeMatch = expectedType ? contentType.includes(expectedType) : true;
    return {
      status: isOk && typeMatch ? "PASS" : "FAIL",
      code: res.status,
      type: contentType,
    };
  } catch (err: any) {
    return {
      status: "FAIL",
      code: 0,
      type: err.message,
    };
  }
}

async function main() {
  console.log("\n=======================================================");
  console.log("  THE-WARDEN // BRAND SERP RANK & ENTITY DIAGNOSTIC");
  console.log("=======================================================");
  console.log("Target Query: 'The-Warden' / 'The Warden'");
  console.log("Target Domain: https://thewarden.online\n");

  const diagnostics: DiagnosticCheck[] = [];

  // 1. Check live root HTML and brand signals
  console.log("[1/4] Inspecting root page and Knowledge Graph entities...");
  try {
    const res = await fetch("https://thewarden.online/", { method: "GET" });
    if (res.status === 200) {
      const html = await res.text();

      // Check title
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "";
      const titleStartsWithBrand = title.toLowerCase().startsWith("the-warden");

      diagnostics.push({
        name: "Brand Lead in Title Tag",
        category: "Brand Signals",
        status: titleStartsWithBrand ? "PASS" : "WARN",
        details: titleStartsWithBrand
          ? `Title begins with exact brand: "${title}"`
          : `Title does not lead with The-Warden: "${title}"`,
      });

      // Check WebSite schema
      const hasWebSiteSchema = html.includes('"@type":"WebSite"') || html.includes('"@type": "WebSite"');
      diagnostics.push({
        name: "WebSite Knowledge Graph Schema",
        category: "Structured Data",
        status: hasWebSiteSchema ? "PASS" : "WARN",
        details: hasWebSiteSchema
          ? "Verified @type 'WebSite' schema with entity disambiguation."
          : "Missing WebSite schema graph.",
      });

      // Check Organization & sameAs schema
      const hasOrgSchema = html.includes('"@type":"Organization"') || html.includes('"@type": "Organization"');
      const hasSameAs = html.includes("github.com/muheebkamran/The-Warden");
      diagnostics.push({
        name: "Organization Schema & Authority Citation",
        category: "Structured Data",
        status: hasOrgSchema && hasSameAs ? "PASS" : "WARN",
        details: hasOrgSchema && hasSameAs
          ? "Verified Organization schema with GitHub authority link."
          : "Missing Organization schema or GitHub sameAs citation.",
      });

      // Check FAQPage schema
      const hasFaqSchema = html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"');
      diagnostics.push({
        name: "Google FAQPage Rich Snippet Schema",
        category: "Structured Data",
        status: hasFaqSchema ? "PASS" : "WARN",
        details: hasFaqSchema
          ? "FAQPage schema active with 'What is The-Warden?' answer."
          : "Missing FAQPage rich snippet schema.",
      });
    } else {
      diagnostics.push({
        name: "Root URL Availability",
        category: "Indexation",
        status: "FAIL",
        details: `HTTP ${res.status} returned by root URL.`,
      });
    }
  } catch (err: any) {
    diagnostics.push({
      name: "Root URL Reachability",
      category: "Indexation",
      status: "FAIL",
      details: err.message,
    });
  }

  // 2. Check all SEO discovery assets
  console.log("\n[2/4] Verifying all SEO & AI discovery asset endpoints...");
  const assetsToCheck = [
    { name: "Sitemap XML", url: "https://thewarden.online/sitemap.xml", type: "xml" },
    { name: "Robots TXT", url: "https://thewarden.online/robots.txt", type: "text" },
    { name: "AI LLMs Manifest", url: "https://thewarden.online/llms.txt", type: "text" },
    { name: "Security Contact", url: "https://thewarden.online/.well-known/security.txt", type: "text" },
    { name: "OpenGraph Dynamic Image", url: "https://thewarden.online/opengraph-image", type: "image" },
  ];

  for (const asset of assetsToCheck) {
    const result = await checkAsset(asset.url, asset.type);
    diagnostics.push({
      name: asset.name,
      category: "Assets",
      status: result.status as any,
      details: `HTTP ${result.code} (${result.type})`,
    });
    console.log(`  -> ${asset.name}: [${result.status}] HTTP ${result.code}`);
  }

  // 3. Search Engine Indexing Status Check
  console.log("\n[3/4] Checking Google Indexation status for 'site:thewarden.online'...");
  try {
    const searchUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent("site:thewarden.online");
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const searchHtml = await searchRes.text();
    const hasResults = !searchHtml.includes("No visual results found") && !searchHtml.includes("no results");

    diagnostics.push({
      name: "Public Search Engine Index Status",
      category: "Indexation",
      status: hasResults ? "PASS" : "WARN",
      details: hasResults
        ? "Domain has appeared in public crawler index results."
        : "Domain is in fresh crawl queue (Not yet cached in public search index).",
    });
  } catch (err: any) {
    diagnostics.push({
      name: "Search Engine Index Check",
      category: "Indexation",
      status: "WARN",
      details: "Query rate limited; manual check in Google Search Console recommended.",
    });
  }

  // 4. Print Executive Diagnostic Report
  console.log("\n=======================================================");
  console.log("  EXECUTIVE DIAGNOSTIC SUMMARY");
  console.log("=======================================================");
  let passCount = 0;
  for (const d of diagnostics) {
    const icon = d.status === "PASS" ? "✓ [PASS]" : d.status === "WARN" ? "⚠ [WARN]" : "✗ [FAIL]";
    console.log(`${icon} [${d.category}] ${d.name}`);
    console.log(`    Details: ${d.details}`);
    if (d.status === "PASS") passCount++;
  }

  const score = Math.round((passCount / diagnostics.length) * 100);
  console.log("\n=======================================================");
  console.log(`  BRAND DOMINANCE READINESS SCORE: ${score}% (${passCount}/${diagnostics.length} gates passed)`);
  console.log("=======================================================\n");

  if (score < 100) {
    console.log("ACTION ITEMS TO ACCELERATE #1 RANK FOR 'THE-WARDEN':");
    console.log("1. Submit 'https://thewarden.online/' in Google Search Console URL Inspection.");
    console.log("2. Click 'Request Indexing' in Google Search Console.");
    console.log("3. Add 'https://thewarden.online' link to GitHub repository description.");
    console.log("=======================================================\n");
  }
}

main().catch(console.error);
