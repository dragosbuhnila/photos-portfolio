const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

if (process.env.STATIC_EXPORT === 'true') {
  require('./build-static');
} else {
  const result = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    cwd: rootDir,
    shell: true,
    env: process.env,
  });

  process.exit(result.status ?? 0);
}
