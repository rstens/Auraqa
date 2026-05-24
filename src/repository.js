import { Pool } from "pg";

export function createInMemoryRepository() {
  const items = [];
  return {
    async init() {},
    async listQuestions() {
      return [...items].sort((a, b) => b.id - a.id);
    },
    async addQuestion(question) {
      items.push({ id: items.length + 1, question });
    },
    async close() {}
  };
}

export function createPostgresRepository(databaseUrl) {
  const pool = new Pool({
    connectionString: databaseUrl
  });

  return {
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS auraqa_questions (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL
        )
      `);
    },
    async listQuestions() {
      const result = await pool.query(
        "SELECT id, question FROM auraqa_questions ORDER BY id DESC"
      );
      return result.rows;
    },
    async addQuestion(question) {
      await pool.query("INSERT INTO auraqa_questions (question) VALUES ($1)", [
        question
      ]);
    },
    async close() {
      await pool.end();
    }
  };
}
