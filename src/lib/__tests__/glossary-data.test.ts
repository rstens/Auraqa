import { describe, it, expect } from "vitest";
import {
  GLOSSARY_TERMS,
  CATEGORIES,
  getCategoryInfo,
  type GlossaryCategory,
} from "../glossary-data";

describe("CATEGORIES", () => {
  it("has 7 categories", () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  it("each category has required fields", () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.badgeClasses).toBeTruthy();
      expect(cat.activeClasses).toBeTruthy();
    }
  });

  it("has unique category IDs", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getCategoryInfo", () => {
  it("returns correct info for each category", () => {
    for (const cat of CATEGORIES) {
      const info = getCategoryInfo(cat.id);
      expect(info.id).toBe(cat.id);
      expect(info.label).toBe(cat.label);
    }
  });
});

describe("GLOSSARY_TERMS", () => {
  it("has at least 80 terms", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(80);
  });

  it("each term has required fields", () => {
    for (const term of GLOSSARY_TERMS) {
      expect(term.id).toBeTruthy();
      expect(term.term).toBeTruthy();
      expect(term.definition).toBeTruthy();
      expect(term.category).toBeTruthy();
      expect(Array.isArray(term.relatedTerms)).toBe(true);
      expect(Array.isArray(term.seeAlso)).toBe(true);
    }
  });

  it("has unique term IDs", () => {
    const ids = GLOSSARY_TERMS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique term names", () => {
    const names = GLOSSARY_TERMS.map((t) => t.term);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all categories are valid", () => {
    const validCategories = new Set(CATEGORIES.map((c) => c.id));
    for (const term of GLOSSARY_TERMS) {
      expect(validCategories.has(term.category)).toBe(true);
    }
  });

  it("all relatedTerms reference existing term IDs", () => {
    const validIds = new Set(GLOSSARY_TERMS.map((t) => t.id));
    for (const term of GLOSSARY_TERMS) {
      for (const relId of term.relatedTerms) {
        expect(
          validIds.has(relId),
          `Term "${term.term}" references non-existent relatedTerm "${relId}"`,
        ).toBe(true);
      }
    }
  });

  it("all seeAlso reference existing term IDs", () => {
    const validIds = new Set(GLOSSARY_TERMS.map((t) => t.id));
    for (const term of GLOSSARY_TERMS) {
      for (const seeId of term.seeAlso) {
        expect(
          validIds.has(seeId),
          `Term "${term.term}" references non-existent seeAlso "${seeId}"`,
        ).toBe(true);
      }
    }
  });

  it("no term references itself in relatedTerms", () => {
    for (const term of GLOSSARY_TERMS) {
      expect(
        term.relatedTerms.includes(term.id),
        `Term "${term.term}" references itself in relatedTerms`,
      ).toBe(false);
    }
  });

  it("no term references itself in seeAlso", () => {
    for (const term of GLOSSARY_TERMS) {
      expect(
        term.seeAlso.includes(term.id),
        `Term "${term.term}" references itself in seeAlso`,
      ).toBe(false);
    }
  });

  it("abbreviation is either null or a non-empty string", () => {
    for (const term of GLOSSARY_TERMS) {
      if (term.abbreviation !== null) {
        expect(term.abbreviation.length).toBeGreaterThan(0);
      }
    }
  });

  it("has terms in each category", () => {
    const categoryCounts = new Map<GlossaryCategory, number>();
    for (const term of GLOSSARY_TERMS) {
      categoryCounts.set(term.category, (categoryCounts.get(term.category) ?? 0) + 1);
    }
    for (const cat of CATEGORIES) {
      expect(categoryCounts.get(cat.id), `Category "${cat.label}" has no terms`).toBeGreaterThan(0);
    }
  });

  it("definitions are non-trivial (at least 20 chars)", () => {
    for (const term of GLOSSARY_TERMS) {
      expect(
        term.definition.length,
        `Term "${term.term}" has a very short definition`,
      ).toBeGreaterThanOrEqual(20);
    }
  });
});
