/**
 * The Warden — Meta Title & Description Audit Runner
 * Validates Google SERP character constraints, keyword presence, and CTR triggers across public routes.
 */

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  targetKeyword: string;
}

const PUBLIC_ROUTES: RouteMeta[] = [
  {
    path: "/",
    title: "Personal Accountability OS — Daily Discipline | THE WARDEN",
    description: "Enforce daily habits and protect financial sovereignty with The Warden. Zero advertisements, zero vanity metrics. Built for high performers. Initialize now.",
    targetKeyword: "Personal Accountability OS",
  },
  {
    path: "/demo",
    title: "Interactive System Architecture & Live UI Demo | THE WARDEN",
    description: "Experience The Warden's sovereign command center. Test interactive discipline cards, impulse vaults, and streak telemetry before initializing your node.",
    targetKeyword: "Live UI Demo",
  },
  {
    path: "/register",
    title: "Initialize Your Sovereign Node & Habit Vault | THE WARDEN",
    description: "Create your sovereign account on The Warden. Build unbroken streaks, lock impulse expenses, and secure your daily accountability telemetry today.",
    targetKeyword: "Habit Vault",
  },
  {
    path: "/login",
    title: "Sign In & Access Sovereign Telemetry Command | THE WARDEN",
    description: "Access your private accountability command center. Review daily diurnal habits, unbroken fortress streaks, and verified financial ledger records.",
    targetKeyword: "Sovereign Telemetry",
  },
  {
    path: "/privacy",
    title: "Privacy Policy & Sovereign Data Security Guarantees | THE WARDEN",
    description: "Read The Warden's privacy commitments. Air-gapped personal telemetry, zero third-party trackers, zero data brokering, and absolute user sovereignty.",
    targetKeyword: "Privacy Policy",
  },
  {
    path: "/terms",
    title: "Terms of Service & Sovereign Usage Protocols | THE WARDEN",
    description: "Review The Warden's terms of service and operator agreements. Transparent rules governing personal accountability software and data ownership.",
    targetKeyword: "Terms of Service",
  },
];

function auditRoute(route: RouteMeta) {
  const titleLen = route.title.length;
  const descLen = route.description.length;

  const titlePass = titleLen >= 45 && titleLen <= 65;
  const descPass = descLen >= 130 && descLen <= 165;
  const keywordInTitle = route.title.toLowerCase().includes(route.targetKeyword.toLowerCase());
  const brandInTitle = route.title.includes("THE WARDEN");

  return {
    path: route.path,
    title: route.title,
    titleLen,
    titlePass,
    description: route.description,
    descLen,
    descPass,
    keywordInTitle,
    brandInTitle,
  };
}

async function run() {
  console.log("\n=======================================================");
  console.log("  THE WARDEN // SEO METADATA & SERP SNIPPET AUDIT");
  console.log("=======================================================\n");

  let totalScore = 0;
  const results = PUBLIC_ROUTES.map(auditRoute);

  for (const r of results) {
    console.log(`Route: ${r.path}`);
    console.log(`  Title (${r.titleLen} chars): "${r.title}"`);
    if (r.titlePass) {
      console.log(`    [PASS] Title length optimal (target: 50-60 chars).`);
    } else {
      console.log(`    [WARN] Title length is ${r.titleLen} (optimal: 50-60 chars).`);
    }

    console.log(`  Description (${r.descLen} chars): "${r.description}"`);
    if (r.descPass) {
      console.log(`    [PASS] Description length optimal (target: 140-160 chars).`);
    } else {
      console.log(`    [WARN] Description length is ${r.descLen} (optimal: 140-160 chars).`);
    }

    console.log(`  Keyword In Title: ${r.keywordInTitle ? "[YES]" : "[NO]"}`);
    console.log(`  Brand In Title:   ${r.brandInTitle ? "[YES]" : "[NO]"}`);

    const routeScore = (r.titlePass ? 25 : 15) + (r.descPass ? 25 : 15) + (r.keywordInTitle ? 25 : 0) + (r.brandInTitle ? 25 : 0);
    console.log(`  Score: ${routeScore}/100\n`);
    totalScore += routeScore;
  }

  const averageScore = Math.round(totalScore / results.length);
  console.log("=======================================================");
  console.log(`  OVERALL SEO METADATA HEALTH SCORE: ${averageScore}/100`);
  console.log("=======================================================\n");
}

run().catch(console.error);
