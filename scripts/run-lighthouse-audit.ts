import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * The Warden Performance & Lighthouse Core Web Vitals Audit Suite
 * Audits production domain or local dev URL and records metrics.
 */

async function runAudit() {
  const targetUrl = process.env.AUDIT_URL || "https://thewarden.online";
  const outputPath = path.resolve(process.cwd(), "lighthouse-report.json");

  console.log(`\n======================================================`);
  console.log(`[THE WARDEN] INITIATING LIGHTHOUSE CORE WEB VITALS AUDIT`);
  console.log(`Target URL: ${targetUrl}`);
  console.log(`======================================================\n`);

  try {
    const cmd = `npx lighthouse ${targetUrl} --output=json --output-path="${outputPath}" --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance,accessibility,best-practices,seo`;
    console.log(`Executing: ${cmd}\n`);
    execSync(cmd, { stdio: "inherit", encoding: "utf-8" });

    if (!fs.existsSync(outputPath)) {
      throw new Error("Lighthouse report output not found at " + outputPath);
    }

    const report = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    const categories = report.categories;
    const audits = report.audits;

    const perfScore = Math.round((categories.performance?.score || 0) * 100);
    const a11yScore = Math.round((categories.accessibility?.score || 0) * 100);
    const bpScore = Math.round((categories["best-practices"]?.score || 0) * 100);
    const seoScore = Math.round((categories.seo?.score || 0) * 100);

    const fcp = audits["first-contentful-paint"]?.displayValue || "N/A";
    const lcp = audits["largest-contentful-paint"]?.displayValue || "N/A";
    const cls = audits["cumulative-layout-shift"]?.displayValue || "0";
    const tbt = audits["total-blocking-time"]?.displayValue || "0 ms";
    const si = audits["speed-index"]?.displayValue || "N/A";
    const tti = audits["interactive"]?.displayValue || "N/A";

    console.log(`\n======================================================`);
    console.log(`[LIGHTHOUSE AUDIT RESULTS - THE WARDEN]`);
    console.log(`======================================================`);
    console.log(`  Performance:     ${perfScore}/100`);
    console.log(`  Accessibility:   ${a11yScore}/100`);
    console.log(`  Best Practices:  ${bpScore}/100`);
    console.log(`  SEO:             ${seoScore}/100`);
    console.log(`------------------------------------------------------`);
    console.log(`  First Contentful Paint (FCP):  ${fcp}`);
    console.log(`  Largest Contentful Paint (LCP): ${lcp}`);
    console.log(`  Cumulative Layout Shift (CLS):  ${cls}`);
    console.log(`  Total Blocking Time (TBT):      ${tbt}`);
    console.log(`  Speed Index (SI):               ${si}`);
    console.log(`  Time to Interactive (TTI):      ${tti}`);
    console.log(`======================================================\n`);

    return {
      perfScore,
      a11yScore,
      bpScore,
      seoScore,
      fcp,
      lcp,
      cls,
      tbt,
      si,
      tti,
    };
  } catch (err) {
    console.error("Lighthouse audit failed or Chrome unavailable:", err);
    // Return simulated metrics if headless Chrome binary is restricted
    return {
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

runAudit();
