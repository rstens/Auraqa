import { createApp } from "./app.js";
import {
  createInMemoryRepository,
  createPostgresRepository
} from "./repository.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const databaseUrl = process.env.DATABASE_URL;

const repository = databaseUrl
  ? createPostgresRepository(databaseUrl)
  : createInMemoryRepository();

await repository.init();

const server = createApp(repository);
server.listen(port, () => {
  console.log(`Auraqa listening on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await repository.close();
  server.close(() => process.exit(0));
});
