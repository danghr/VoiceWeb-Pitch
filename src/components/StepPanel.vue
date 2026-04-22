<template>
  <section class="step-panel">
    <div class="step-head">
      <p class="step-index">步骤 {{ stepIndex + 1 }} / {{ totalSteps }}</p>
      <h2>{{ displayTitle || step?.title || '未开始' }}</h2>
    </div>

    <div class="instruction" v-html="displayInstruction || step?.instruction"></div>

    <div class="feedback-row">
      <p class="hint" v-if="hintMessage">{{ hintMessage }}</p>
    </div>

    <div class="actions">
      <button
        v-if="step?.audio?.enableMic"
        class="btn btn-primary"
        @click="$emit('toggle-recording')"
      >
        {{ isRecording ? 'Stop' : 'Start' }}
      </button>

      <button
        v-if="step?.ui?.showReplayButton"
        class="btn"
        @click="$emit('replay')"
      >
        重听参考音
      </button>

      <button
        v-if="step?.isRandomPractice"
        class="btn btn-accent"
        @click="$emit('randomize')"
      >
        {{ step?.randomJumpPair ? '换一组' : '换一个' }}
      </button>

      <label v-if="step?.ui?.allowToggleTarget" class="toggle-label">
        <input
          type="checkbox"
          :checked="showTarget"
          @change="$emit('toggle-target', $event.target.checked)"
        />
        参考线与键盘
      </label>
    </div>

    <div class="nav-row">
      <button
        class="btn"
        :disabled="stepIndex <= 0"
        @click="$emit('prev')"
      >
        上一步
      </button>
      <button
        class="btn"
        :disabled="stepIndex >= totalSteps - 1"
        @click="$emit('next')"
      >
        下一步
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  step: {
    type: Object,
    default: null,
  },
  stepIndex: {
    type: Number,
    required: true,
  },
  totalSteps: {
    type: Number,
    required: true,
  },
  hintMessage: {
    type: String,
    default: '',
  },
  isRecording: {
    type: Boolean,
    default: false,
  },
  showTarget: {
    type: Boolean,
    default: true,
  },
  displayInstruction: {
    type: String,
    default: '',
  },
  displayTitle: {
    type: String,
    default: '',
  },
});

defineEmits(['toggle-recording', 'replay', 'next', 'prev', 'randomize', 'toggle-target']);
</script>

<style scoped>
.step-panel {
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  background: #FFFFFF;
  padding: 22px;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.06);
}

.step-index {
  margin: 0 0 6px;
  color: #64748B;
  font-size: 13px;
}

.step-head h2 {
  margin: 0;
  font-size: 24px;
  color: #0F172A;
}

.instruction {
  margin-top: 12px;
  font-size: 16px;
  color: #334155;
  line-height: 1.7;
}

.feedback-row {
  min-height: 28px;
  margin-top: 14px;
}

.hint {
  margin: 0;
  font-size: 14px;
  color: #EA580C;
}

.actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-row {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.btn {
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
  color: #0F172A;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn.btn-primary {
  background: #0F172A;
  color: #FFFFFF;
  border-color: #0F172A;
}

.btn.btn-accent {
  background: #EFF6FF;
  border-color: #93C5FD;
  color: #1D4ED8;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #2563EB;
}
</style>
