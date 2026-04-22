<template>
  <header class="level-header">
    <div class="left-group">
      <h1>音准训练引擎</h1>
      <p>统一引擎 + 配置化关卡</p>
    </div>

    <div class="level-dots">
      <button
        v-for="(level, index) in levels"
        :key="level.id"
        class="level-dot"
        :class="dotClass(level.id, index)"
        @click="$emit('select-level', level.id)"
      >
        {{ index + 1 }}
      </button>
    </div>

    <div class="mode-group">
      <span class="mode-label">音域模式</span>
      <label class="mode-toggle">
        <input
          type="checkbox"
          :checked="vocalMode === 'high'"
          @change="$emit('toggle-vocal-mode', $event.target.checked ? 'high' : 'low')"
        />
        <span class="mode-track">
          <span class="mode-left">低音域（C3-A3）</span>
          <span class="mode-right">高音域（C4-A4）</span>
          <span class="mode-thumb"></span>
        </span>
      </label>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  levels: {
    type: Array,
    default: () => [],
  },
  currentLevelId: {
    type: String,
    required: true,
  },
  completedLevelIds: {
    type: Array,
    default: () => [],
  },
  vocalMode: {
    type: String,
    default: 'low',
  },
});

defineEmits(['select-level', 'toggle-vocal-mode']);

function dotClass(levelId, index) {
  if (props.currentLevelId === levelId) {
    return 'is-current';
  }
  if (props.completedLevelIds.includes(levelId)) {
    return 'is-complete';
  }
  return 'is-open';
}
</script>

<style scoped>
.level-header {
  height: 92px;
  border-radius: 22px;
  padding: 14px 20px;
  background: linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 100%);
  border: 1px solid #E2E8F0;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 18px;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
}

.left-group h1 {
  margin: 0;
  font-size: 24px;
  color: #0F172A;
}

.left-group p {
  margin: 2px 0 0;
  color: #64748B;
  font-size: 13px;
}

.level-dots {
  display: flex;
  gap: 10px;
}

.level-dot {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #CBD5E1;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.level-dot:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.2);
}

.level-dot.is-locked {
  background: #F1F5F9;
  color: #94A3B8;
  cursor: not-allowed;
}

.level-dot.is-open {
  background: #EFF6FF;
  color: #1D4ED8;
}

.level-dot.is-current {
  background: #2563EB;
  color: #FFFFFF;
  border-color: #1D4ED8;
}

.level-dot.is-complete {
  background: #DBEAFE;
  color: #1E40AF;
  border-color: #93C5FD;
}

.mode-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-label {
  color: #334155;
  font-size: 13px;
}

.mode-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.mode-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.mode-track {
  position: relative;
  width: 292px;
  height: 36px;
  border-radius: 999px;
  background: #E2E8F0;
  border: 1px solid #CBD5E1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
}

.mode-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 4px);
  height: 30px;
  border-radius: 999px;
  background: #FFFFFF;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.15);
  transition: transform 0.2s ease;
}

.mode-toggle input:checked + .mode-track .mode-thumb {
  transform: translateX(calc(100% + 2px));
}

.mode-left,
.mode-right {
  position: relative;
  z-index: 1;
}

.mode-left {
  text-align: center;
}

.mode-right {
  text-align: center;
}
</style>
