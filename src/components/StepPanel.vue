<template>
  <div class="step-panel-wrapper">
    <section class="step-panel">
      <div class="step-head">
        <p class="step-index">步骤 {{ stepIndex + 1 }} / {{ totalSteps }}</p>
        <h2>{{ displayTitle || step?.title || '未开始' }}</h2>
      </div>

      <div ref="scrollRef" class="instruction-scroll" v-html="displayInstruction || step?.instruction"></div>

      <div class="feedback-row">
        <p class="hint" v-if="hintMessage">{{ hintMessage }}</p>
      </div>

      <div class="bottom-area">
        <div class="actions" v-if="hasActions">
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
            {{ step?.randomJumpPair || step?.randomInterval ? '换一组' : '换一个' }}
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
            v-if="stepIndex <= 0"
            class="btn"
            :disabled="isFirstLevel"
            @click="$emit('prev-level')"
          >
            上一关
          </button>
          <button
            v-else
            class="btn"
            @click="$emit('prev')"
          >
            上一步
          </button>

          <button
            v-if="stepIndex >= totalSteps - 1"
            class="btn"
            :disabled="isLastLevel"
            @click="$emit('next-level')"
          >
            下一关
          </button>
          <button
            v-else
            class="btn"
            @click="$emit('next')"
          >
            下一步
          </button>
        </div>
      </div>
    </section>

    <footer class="panel-footer" v-if="footerHtml" v-html="footerHtml"></footer>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps({
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
  isFirstLevel: {
    type: Boolean,
    default: false,
  },
  isLastLevel: {
    type: Boolean,
    default: false,
  },
  footerHtml: {
    type: String,
    default: '',
  },
});

const scrollRef = ref(null);

// 切换步骤时，滚动回顶部
watch(
  () => [props.stepIndex, props.displayInstruction],
  () => {
    nextTick(() => {
      if (scrollRef.value) {
        scrollRef.value.scrollTop = 0;
      }
    });
  },
);

const hasActions = computed(() => {
  return props.step?.audio?.enableMic
    || props.step?.ui?.showReplayButton
    || props.step?.isRandomPractice
    || props.step?.ui?.allowToggleTarget;
});

defineEmits(['toggle-recording', 'replay', 'next', 'prev', 'randomize', 'toggle-target', 'prev-level', 'next-level']);
</script>

<style scoped>
.step-panel-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.step-panel {
  flex: 85;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  background: #FFFFFF;
  padding: 18px 22px;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.panel-footer {
  flex: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  background: #FFFFFF;
  padding: 8px 14px;
  min-height: 0;
  overflow: hidden;
}

.step-index {
  margin: 0 0 4px;
  color: #64748B;
  font-size: 13px;
}

.step-head {
  flex-shrink: 0;
}

.step-head h2 {
  margin: 0;
  font-size: 22px;
  color: #0F172A;
}

.instruction-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: 10px;
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
  padding-right: 4px;
}

.instruction-scroll::-webkit-scrollbar {
  width: 5px;
}

.instruction-scroll::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

.instruction-scroll :deep(p) {
  margin: 6px 0;
}

.instruction-scroll :deep(ul),
.instruction-scroll :deep(ol) {
  margin: 6px 0;
  padding-left: 20px;
}

.instruction-scroll :deep(li) {
  margin: 3px 0;
}

.instruction-scroll :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
}

.feedback-row {
  min-height: 20px;
  flex-shrink: 0;
}

.hint {
  margin: 0;
  font-size: 14px;
  color: #EA580C;
}

.bottom-area {
  flex-shrink: 0;
  margin-top: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.nav-row {
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
