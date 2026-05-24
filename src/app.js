import http from "node:http";
import { readFile } from "node:fs/promises";

const htmxAsset = new URL("../node_modules/htmx.org/dist/htmx.min.js", import.meta.url);
const htmxAssetPromise = readFile(htmxAsset, "utf8");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderQuestionItems(questions) {
  if (questions.length === 0) {
    return "<li>No questions yet.</li>";
  }

  return questions
    .map((question) => `<li>${escapeHtml(question.question)}</li>`)
    .join("");
}

function renderPage(questionItemsHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Auraqa</title>
    <script src="/assets/htmx.min.js"></script>
  </head>
  <body>
    <main>
      <h1>Auraqa</h1>
      <form hx-post="/api/questions" hx-target="#question-list" hx-swap="innerHTML">
        <label for="question">Question</label>
        <input id="question" name="question" required />
        <button type="submit">Add</button>
      </form>
      <ul id="question-list">${questionItemsHtml}</ul>
    </main>
  </body>
</html>`;
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendHtml(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "text/html; charset=utf-8" });
  response.end(body);
}

function sendJs(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/javascript; charset=utf-8"
  });
  response.end(body);
}

export function createApp(repository) {
  return http.createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/") {
        const questions = await repository.listQuestions();
        sendHtml(response, 200, renderPage(renderQuestionItems(questions)));
        return;
      }

      if (request.method === "GET" && request.url === "/assets/htmx.min.js") {
        sendJs(response, 200, await htmxAssetPromise);
        return;
      }

      if (request.method === "GET" && request.url === "/api/questions") {
        const questions = await repository.listQuestions();
        sendHtml(response, 200, renderQuestionItems(questions));
        return;
      }

      if (request.method === "POST" && request.url === "/api/questions") {
        const body = await readBody(request);
        const question = new URLSearchParams(body).get("question")?.trim();
        if (question) {
          await repository.addQuestion(question);
        }

        const questions = await repository.listQuestions();
        sendHtml(response, 200, renderQuestionItems(questions));
        return;
      }

      sendHtml(response, 404, "Not found");
    } catch (error) {
      console.error("Request handling failed", error);
      sendHtml(response, 500, "Internal server error");
    }
  });
}
