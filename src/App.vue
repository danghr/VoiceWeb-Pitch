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

    <div class="status-line">
      <span>当前舒适音域：{{ store.userRange.low }} - {{ store.userRange.high }}</span>
      <span>模式：{{ modeLabel }} ｜ 当前关卡：{{ currentLevel?.title }}（{{ currentLevel?.subtitle }}）</span>
    </div>

    <LevelRunner
      v-if="currentLevel"
      :level-config="currentLevel"
      @level-complete="handleLevelComplete"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LevelHeader from './components/LevelHeader.vue';
import LevelRunner from './components/LevelRunner.vue';
import ScreenGuard from './components/ScreenGuard.vue';
import levels from './levels';
import { useTrainingStore } from './stores/training';

const store = useTrainingStore();
store.initLevels(levels);

const currentLevel = computed(() => levels.find((level) => level.id === store.currentLevelId) || levels[0]);
const modeLabel = computed(() => (store.vocalMode === 'high' ? '高音域（C4-B4）' : '低音域（C3-B3）'));

function handleSelectLevel(levelId) {
  store.setCurrentLevel(levelId);
}

function handleToggleVocalMode(mode) {
  store.setVocalMode(mode);
}

function handleLevelComplete(levelId) {
  store.markLevelCompleted(levelId);
}
</script>

<style scoped>
.app-shell {
  width: min(1360px, calc(100vw - 28px));
  margin: 0 auto;
  padding: 10px 0;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 10px;
  height: 90vh;
  max-height: 90vh;
  overflow: hidden;
}

.status-line {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  color: #334155;
  font-size: 14px;
}
</style>
