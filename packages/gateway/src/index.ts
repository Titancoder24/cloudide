import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();

async function main(): Promise<void> {
  const app = await createApp(config);

  serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    (info) => {
      console.error(`LLM-IDE Gateway running on http://localhost:${info.port}`);
      console.error(`Health: http://localhost:${info.port}/health`);
      console.error(`Auth:   http://localhost:${info.port}/api/auth/login`);
    }
  );
}

main().catch((err) => {
  console.error('Failed to start gateway:', err);
  process.exit(1);
});
