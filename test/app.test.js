import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

function createStubRepository(initial = []) {
  const items = [...initial];
  let nextId = items.length + 1;
  return {
    async listQuestions() {
      return [...items].sort((a, b) => b.id - a.id);
    },
    async addQuestion(question) {
      items.push({ id: nextId++, question });
    }
  };
}

async function withServer(repository, run) {
  const app = createApp(repository);
  await new Promise((resolve) => app.listen(0, resolve));
  const { port } = app.address();
  try {
    await run(port);
  } finally {
    await new Promise((resolve) => app.close(resolve));
  }
}

test("GET / returns htmx page with list", async () => {
  const repository = createStubRepository([{ id: 1, question: "Existing" }]);

  await withServer(repository, async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /hx-post="\/api\/questions"/);
    assert.match(body, /<li>Existing<\/li>/);
  });
});

test("GET /assets/htmx.min.js serves local htmx script", async () => {
  const repository = createStubRepository();

  await withServer(repository, async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/assets/htmx.min.js`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("content-type"),
      "application/javascript; charset=utf-8"
    );
    assert.match(body, /htmx/);
  });
});

test("POST /api/questions stores and escapes question text", async () => {
  const repository = createStubRepository();

  await withServer(repository, async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/questions`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "question=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
    });

    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.equal(body.toLowerCase().includes("<script>"), false);
  });
});

test("POST /api/questions ignores whitespace-only values", async () => {
  const repository = createStubRepository([{ id: 1, question: "Existing" }]);

  await withServer(repository, async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/questions`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "question=%20%20%20"
    });

    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /<li>Existing<\/li>/);
    assert.equal((body.match(/<li>/g) ?? []).length, 1);
  });
});
