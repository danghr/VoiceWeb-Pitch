import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function appVersion() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    return `v${pkg.version}`;
  } catch {
    return 'dev';
  }
}

function gitHash() {
  try {
    return execSync('git rev-parse --short=6 HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return '000000';
  }
}

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
    __APP_BUILD__: JSON.stringify(gitHash()),
  },
});
