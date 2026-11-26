const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'src', 'app');

const targets = [
  { from: path.join(appDir, 'api'), to: path.join(appDir, '_api') },
  { from: path.join(appDir, 'manage'), to: path.join(appDir, '_manage') },
  { from: path.join(appDir, 'my_projects'), to: path.join(appDir, '_my_projects') },
];

function moveFolder(source, destination, retries = 10, delayMs = 300) {
  if (!fs.existsSync(source)) return;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      fs.renameSync(source, destination);
      return;
    } catch (err) {
      if (attempt === retries) {
        console.error(`✖ [build-static] Failed to rename ${source} to ${destination}:`, err.message);
        throw err;
      }
      // Brief pause to allow Windows filesystem handles to release
      const start = Date.now();
      while (Date.now() - start < delayMs) {}
    }
  }
}

console.log('⚡ [build-static] Preparing files for static export...');

// If an earlier process was interrupted, ensure clean starting state
for (const target of targets) {
  if (fs.existsSync(target.to) && !fs.existsSync(target.from)) {
    moveFolder(target.to, target.from);
  }
}

let exitCode = 0;

try {
  for (const target of targets) {
    if (fs.existsSync(target.from)) {
      moveFolder(target.from, target.to);
    }
  }

  const rawBasePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || '';
  const basePath = rawBasePath && rawBasePath !== '/'
    ? (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, '')
    : '';

  console.log(`⚡ [build-static] Running Next.js static build (basePath: "${basePath}")...`);
  const result = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true,
    env: {
      ...process.env,
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_STATIC_EXPORT: 'true',
      BASE_PATH: basePath,
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
  });

  exitCode = result.status ?? 0;
  if (exitCode === 0) {
    fs.writeFileSync(path.join(rootDir, 'out', '.nojekyll'), '');
    console.log('✔ [build-static] Static site successfully exported to ./out');
  } else {
    console.error('✖ [build-static] Next.js build failed with exit code:', exitCode);
  }
} catch (err) {
  console.error('✖ [build-static] Unexpected error during static build:', err);
  exitCode = 1;
} finally {
  console.log('⚡ [build-static] Restoring local CMS and API routes...');
  for (const target of targets) {
    if (fs.existsSync(target.to)) {
      moveFolder(target.to, target.from);
    }
  }
  console.log('✔ [build-static] Local CMS routes restored.');
  try {
    require('./clean-db');
  } catch {}
  process.exit(exitCode);
}
