/**
 * Database seed script for AuraQA.
 *
 * Populates forum categories and initial tags for the testing community.
 * Run with: npx tsx src/db/seed.ts
 *
 * @see docs/DATABASE.md for schema details
 */

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { forumCategories, tags, glossaryTerms } from "./schema";
import { GLOSSARY_TERMS } from "../lib/glossary-data";
import { uuidv7 } from "uuidv7";

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  console.log("Seeding forum categories...");
  await db
    .insert(forumCategories)
    .values([
      {
        name: "Test Automation",
        slug: "test-automation",
        description: "Automated testing frameworks, tools, and strategies",
        sortOrder: 1,
      },
      {
        name: "Manual Testing",
        slug: "manual-testing",
        description: "Manual testing techniques, exploratory testing, and test case design",
        sortOrder: 2,
      },
      {
        name: "Performance Testing",
        slug: "performance-testing",
        description: "Load testing, stress testing, and performance optimization",
        sortOrder: 3,
      },
      {
        name: "Security Testing",
        slug: "security-testing",
        description: "Penetration testing, vulnerability assessment, and security best practices",
        sortOrder: 4,
      },
      {
        name: "CI/CD & DevOps",
        slug: "ci-cd-devops",
        description:
          "Continuous integration, continuous delivery, and DevOps practices for testing",
        sortOrder: 5,
      },
      {
        name: "Mobile Testing",
        slug: "mobile-testing",
        description: "Testing mobile applications on iOS, Android, and cross-platform frameworks",
        sortOrder: 6,
      },
      {
        name: "API Testing",
        slug: "api-testing",
        description: "REST, GraphQL, and gRPC API testing strategies and tools",
        sortOrder: 7,
      },
      {
        name: "General Discussion",
        slug: "general-discussion",
        description: "Anything related to software testing that doesn't fit other categories",
        sortOrder: 8,
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding initial tags...");
  await db
    .insert(tags)
    .values([
      { name: "Selenium", slug: "selenium" },
      { name: "Cypress", slug: "cypress" },
      { name: "Playwright", slug: "playwright" },
      { name: "Jest", slug: "jest" },
      { name: "JUnit", slug: "junit" },
      { name: "TestNG", slug: "testng" },
      { name: "Appium", slug: "appium" },
      { name: "JMeter", slug: "jmeter" },
      { name: "k6", slug: "k6" },
      { name: "Postman", slug: "postman" },
      { name: "REST API", slug: "rest-api" },
      { name: "GraphQL", slug: "graphql" },
      { name: "Unit Testing", slug: "unit-testing" },
      { name: "Integration Testing", slug: "integration-testing" },
      { name: "E2E Testing", slug: "e2e-testing" },
      { name: "TDD", slug: "tdd" },
      { name: "BDD", slug: "bdd" },
      { name: "Agile", slug: "agile" },
      { name: "CI/CD", slug: "ci-cd" },
      { name: "Docker", slug: "docker" },
      { name: "Kubernetes", slug: "kubernetes" },
      { name: "Test Management", slug: "test-management" },
      { name: "Bug Tracking", slug: "bug-tracking" },
      { name: "Code Coverage", slug: "code-coverage" },
      { name: "Accessibility", slug: "accessibility" },
      { name: "Visual Testing", slug: "visual-testing" },
      { name: "Contract Testing", slug: "contract-testing" },
      { name: "Chaos Engineering", slug: "chaos-engineering" },
      { name: "AI in Testing", slug: "ai-in-testing" },
      { name: "Test Data", slug: "test-data" },
    ])
    .onConflictDoNothing();

  console.log("Seeding glossary terms...");
  // Pass 1: insert all terms with stable IDs based on slug
  const slugToId = new Map<string, string>();
  for (const term of GLOSSARY_TERMS) {
    const id = uuidv7();
    slugToId.set(term.id, id);
    await db
      .insert(glossaryTerms)
      .values({
        id,
        term: term.term,
        abbreviation: term.abbreviation,
        definition: term.definition,
        category: term.category,
        relatedTerms: [],
        seeAlso: [],
      })
      .onConflictDoNothing();
  }

  // Pass 2: resolve slug references to UUIDs and update
  const { eq } = await import("drizzle-orm");
  const existingTerms = await db
    .select({ id: glossaryTerms.id, term: glossaryTerms.term })
    .from(glossaryTerms);
  const termNameToId = new Map<string, string>();
  for (const row of existingTerms) {
    termNameToId.set(row.term, row.id);
  }
  for (const term of GLOSSARY_TERMS) {
    const dbId = termNameToId.get(term.term);
    if (!dbId) continue;
    const resolvedRelated = term.relatedTerms
      .map((slug) => {
        const rel = GLOSSARY_TERMS.find((t) => t.id === slug);
        return rel ? termNameToId.get(rel.term) : undefined;
      })
      .filter((id): id is string => !!id);
    const resolvedSeeAlso = term.seeAlso
      .map((slug) => {
        const rel = GLOSSARY_TERMS.find((t) => t.id === slug);
        return rel ? termNameToId.get(rel.term) : undefined;
      })
      .filter((id): id is string => !!id);
    if (resolvedRelated.length > 0 || resolvedSeeAlso.length > 0) {
      await db
        .update(glossaryTerms)
        .set({ relatedTerms: resolvedRelated, seeAlso: resolvedSeeAlso })
        .where(eq(glossaryTerms.id, dbId));
    }
  }

  console.log("Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
