import { defineStore } from 'pinia';

export const useTrainingStore = defineStore('training', {
  state: () => ({
    levelList: [],
    currentLevelId: '',
    completedLevelIds: [],
    micActive: false,
    vocalMode: 'low',
    userRange: {
      low: 'C3',
      high: 'A3',
    },
  }),
  getters: {
    unlockedCount(state) {
      return Math.min(state.levelList.length, state.completedLevelIds.length + 1);
    },
    currentLevelIndex(state) {
      return state.levelList.findIndex((level) => level.id === state.currentLevelId);
    },
  },
  actions: {
    initLevels(levelList) {
      this.levelList = levelList.map((level) => ({
        id: level.id,
        title: level.title,
      }));
      if (!this.currentLevelId && levelList.length) {
        this.currentLevelId = levelList[0].id;
      }
    },
    setCurrentLevel(levelId) {
      const index = this.levelList.findIndex((level) => level.id === levelId);
      if (index === -1) {
        return;
      }
      this.currentLevelId = levelId;
    },
    setVocalMode(mode) {
      const nextMode = mode === 'high' ? 'high' : 'low';
      this.vocalMode = nextMode;

      if (nextMode === 'high') {
        this.userRange = { low: 'C4', high: 'A4' };
        return;
      }

      this.userRange = { low: 'C3', high: 'A3' };
    },
    setMicActive(active) {
      this.micActive = Boolean(active);
    },
    markLevelCompleted(levelId) {
      if (!this.completedLevelIds.includes(levelId)) {
        this.completedLevelIds.push(levelId);
      }
    },
    setUserRange(range) {
      this.userRange = {
        low: range.low,
        high: range.high,
      };
    },
  },
});
