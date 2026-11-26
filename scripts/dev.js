#!/usr/bin/env node
/**
 * dev.js — Smart Next.js launcher with port fallback.
 *
 * Usage:
 *   node scripts/dev.js          → next dev  (development)
 *   node scripts/dev.js start    → next start (production)
 *
 * Tries PORT env var first, then 3000, 3001, 3002, 3003.
 * Skips any port already in use and picks the next free one.
 */

const { createServer } = require('net');
const { spawn } = require('child_process');

const mode = process.argv[2] === 'start' ? 'start' : 'dev';

const PREFERRED_PORTS = [
  process.env.PORT ? Number(process.env.PORT) : null,
  3000,
  3001,
  3002,
  3003,
].filter(Boolean);

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port);
  });
}

async function findFreePort() {
  for (const port of PREFERRED_PORTS) {
    if (await isPortFree(port)) return port;
    console.log(`⚠  Port ${port} is in use, trying next…`);
  }
  return null;
}

(async () => {
  const port = await findFreePort();

  if (!port) {
    console.error(
      `✖  All candidate ports (${PREFERRED_PORTS.join(', ')}) are busy.\n` +
        `   Kill the process using one of them, or set PORT=<number> and retry.`
    );
    process.exit(1);
  }

  console.log(`▶  Starting Next.js (${mode}) on http://localhost:${port}…`);

  const child = spawn(
    'node',
    ['node_modules/next/dist/bin/next', mode, '--port', String(port)],
    { stdio: 'inherit', shell: false }
  );

  child.on('exit', (code) => process.exit(code ?? 0));

  // Forward signals so Ctrl-C cleanly stops the child
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => child.kill(sig));
  }
})();
