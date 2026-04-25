<template>
  <ScreenGuard />
  <div class="app-shell">
    <LevelHeader
      :levels="levels"
      :current-level-id="store.currentLevelId"
      :completed-level-ids="store.completedLevelIds"
      :vocal-mode="store.vocalMode"
      @select-level="handleSelectLevel"
      @toggle-vocal-mode="handleToggleVocalMode"
    />

    <div class="main-area">
      <LevelRunner
        v-if="currentLevel"
        :level-config="currentLevel"
        :is-first-level="currentLevelIndex <= 0"
        :is-last-level="currentLevelIndex >= levels.length - 1"
        :footer-html="footerHtml"
        @level-complete="handleLevelComplete"
        @prev-level="handlePrevLevel"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import LevelHeader from './components/LevelHeader.vue';
import LevelRunner from './components/LevelRunner.vue';
import ScreenGuard from './components/ScreenGuard.vue';
import levels from './levels';
import { useTrainingStore } from './stores/training';

const store = useTrainingStore();
store.initLevels(levels);

const currentLevel = computed(() => levels.find((level) => level.id === store.currentLevelId) || levels[0]);
const currentLevelIndex = computed(() => levels.findIndex((level) => level.id === store.currentLevelId));

const footerHtml = ref('');

function buildFooter(filingHtml) {
  const version = __APP_VERSION__;
  const build = __APP_BUILD__;
  const git_url = __APP_GIT_URL__;
  const versionLine = `音准训练器 ${version} <span style="margin:0 8px;">|</span> Build ${build} <span style="margin:0 8px;">|</span> <a href="${git_url}" target="_blank" rel="noopener" style="color:#94A3B8;text-decoration:none;">源码</a><br>`;
  return `<div style="text-align:center;font-size:12px;color:#94A3B8;line-height:1.8;">${versionLine}${filingHtml}</div>`;
}

onMounted(async () => {
  let filingHtml = '';
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}footer.html`);
    if (res.ok) {
      const text = await res.text();
      if (text.trim()) filingHtml = text;
    }
  } catch {
    // footer.html 不存在，备案信息留空
  }
  footerHtml.value = buildFooter(filingHtml);
});

function handleSelectLevel(levelId) {
  store.setCurrentLevel(levelId);
}

function handleToggleVocalMode(mode) {
  store.setVocalMode(mode);
}

function handleLevelComplete(levelId) {
  store.markLevelCompleted(levelId);
  // 自动跳转到下一关
  const idx = levels.findIndex((l) => l.id === levelId);
  if (idx >= 0 && idx < levels.length - 1) {
    store.setCurrentLevel(levels[idx + 1].id);
  }
}

function handlePrevLevel() {
  const idx = currentLevelIndex.value;
  if (idx > 0) {
    store.setCurrentLevel(levels[idx - 1].id);
  }
}
</script>

<style scoped>
.app-shell {
  width: min(1360px, calc(100vw - 28px));
  margin: 0 auto;
  padding: 10px 0;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  height: 90vh;
  max-height: 90vh;
  overflow: hidden;
}

.main-area {
  min-height: 0;
  overflow: hidden;
}
</style>
