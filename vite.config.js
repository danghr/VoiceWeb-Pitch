import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execSync } from 'child_process';

function gitTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
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
    __APP_VERSION__: JSON.stringify(gitTag()),
    __APP_BUILD__: JSON.stringify(gitHash()),
  },
});
