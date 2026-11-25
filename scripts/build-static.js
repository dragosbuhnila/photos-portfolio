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

function moveFolder(source, destination) {
  if (fs.existsSync(source)) {
    fs.renameSync(source, destination);
  }
}

console.log('⚡ [build-static] Preparing files for static export...');
const movedTargets = [];

let exitCode = 0;

try {
  for (const target of targets) {
    if (fs.existsSync(target.from)) {
      moveFolder(target.from, target.to);
      movedTargets.push(target);
    }
  }

  console.log('⚡ [build-static] Running Next.js static build...');
  const result = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true,
    env: {
      ...process.env,
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_STATIC_EXPORT: 'true',
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
  for (const target of movedTargets) {
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
