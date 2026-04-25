<template>
  <section class="runner-layout" v-if="currentStep">
    <div class="left-panel">
      <div class="visual-row">
        <aside class="piano-slot">
          <div class="piano-main">
            <PianoRoll
              v-if="pianoVisible"
              :highlight-notes="pianoHighlightNotes"
              :active-note="activePianoNote"
              @note-click="handlePianoClick"
            />
            <div v-else class="piano-placeholder"></div>
          </div>
        </aside>

        <div class="canvas-slot">
          <div v-if="currentStep.ui.showPitchCanvas" class="canvas-wrap">
            <CanvasRenderer
              ref="canvasRef"
              :pitch-points="pitchPoints"
              :volume-points="[]"
              :target-notes="visibleTargetNotes"
            />
          </div>
          <div v-else class="canvas-placeholder" :style="{ height: PIANO_CANVAS_HEIGHT + 'px' }">当前步骤不显示音高窗格</div>


        </div>
      </div>
    </div>

    <aside class="right-panel">
      <StepPanel
        :step="currentStep"
        :step-index="currentStepIndex"
        :total-steps="totalSteps"
        :hint-message="hintMessage"
        :is-recording="isRecording"
        :show-target="showTarget"
        :display-instruction="displayInstruction"
        :display-title="displayTitle"
        :is-first-level="isFirstLevel"
        :is-last-level="isLastLevel"
        :footer-html="footerHtml"
        @toggle-recording="handleToggleRecording"
        @replay="handleReplay"
        @next="nextStep"
        @prev="prevStep"
        @randomize="handleRandomize"
        @toggle-target="handleToggleTarget"
        @prev-level="emit('prev-level')"
        @next-level="handleNextLevel"
      />
    </aside>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import CanvasRenderer from '../core/CanvasRenderer.vue';
import { audioEngine } from '../core/AudioEngine';
import { useTrainingStore } from '../stores/training';
import { buildNoteRange, freqToMidi, freqToNote, isWhiteKey, midiToFreq, midiToNote, noteToFreq, noteToMidi, PIANO_CANVAS_HEIGHT } from '../utils/music';
import PianoRoll from './PianoRoll.vue';
import StepPanel from './StepPanel.vue';

const props = defineProps({
  levelConfig: { type: Object, required: true },
  isFirstLevel: { type: Boolean, default: false },
  isLastLevel: { type: Boolean, default: false },
  footerHtml: { type: String, default: '' },
});

const emit = defineEmits(['level-complete', 'prev-level']);
const store = useTrainingStore();

const canvasRef = ref(null);
const currentStepIndex = ref(0);
const pitchPoints = ref([]);
const volumePoints = ref([]);
const runtimeTargetNotes = ref([]);
const runtimeReferenceNotes = ref([]);
const activePianoNote = ref('');
const hintMessage = ref('');
const lastVolume = ref(0);
const showTarget = ref(true);
const rangeVoicedMs = ref(0);
const rangeLastVoicedAt = ref(0);
const RANGE_DETECT_DURATION = 5000;
const smoothedMidi = ref(null);
const SMOOTH_ALPHA = 0.35; // EMA 平滑系数，越小越平滑
let pianoDebounceTimer = null;
let lastPianoNote = '';

const currentStep = computed(() => props.levelConfig.steps[currentStepIndex.value] || null);
const totalSteps = computed(() => props.levelConfig.steps.length);
const isRecording = computed(() => store.micActive && Boolean(currentStep.value?.audio?.enableMic));

const pianoHighlightNotes = computed(() => {
  const set = new Set([
    ...transposeNotes(currentStep.value?.ui?.pianoHighlightNotes || []),
    ...runtimeTargetNotes.value,
  ]);
  return Array.from(set);
});

const visibleTargetNotes = computed(() => {
  if (!currentStep.value) return [];
  if (!showTarget.value) return [];
  return runtimeTargetNotes.value;
});

// 高音域模式下，将指令文本中的 C3-B3 音名替换为 C4-B4
const displayInstruction = computed(() => {
  const raw = currentStep.value?.instruction || '';
  if (store.vocalMode !== 'high') return raw;
  return raw.replace(/([A-G]#?)3/g, '$14');
});

const displayTitle = computed(() => {
  const raw = currentStep.value?.title || '';
  if (store.vocalMode !== 'high') return raw;
  return raw.replace(/([A-G]#?)3/g, '$14');
});

// 钢琴是否可见：showPiano 为 true，且如果有 allowToggleTarget 则跟随 showTarget
const pianoVisible = computed(() => {
  if (!currentStep.value?.ui?.showPiano) return false;
  if (currentStep.value?.ui?.allowToggleTarget && !showTarget.value) return false;
  return true;
});

function prunePoints(points, maxCount = 1200) {
  return points.length <= maxCount ? points : points.slice(points.length - maxCount);
}

function resetStepState() {
  pitchPoints.value = [];
  volumePoints.value = [];
  runtimeTargetNotes.value = [];
  runtimeReferenceNotes.value = [];
  activePianoNote.value = '';
  hintMessage.value = '';
  lastVolume.value = 0;
  if (canvasRef.value?.clear) canvasRef.value.clear();
}

function mapUserRangeByAvgFreq(avgFreq) {
  return avgFreq < noteToFreq('A3')
    ? { low: 'C3', high: 'B3' }
    : { low: 'C4', high: 'B4' };
}

function randomWhiteNoteByRange(exclude = []) {
  const notes = buildNoteRange(store.userRange.low, store.userRange.high)
    .filter(isWhiteKey)
    .filter((n) => !exclude.includes(n));
  if (!notes.length) {
    // 如果排除后没有可选音，回退到不排除
    const all = buildNoteRange(store.userRange.low, store.userRange.high).filter(isWhiteKey);
    return all.length ? all[Math.floor(Math.random() * all.length)] : 'C3';
  }
  return notes[Math.floor(Math.random() * notes.length)];
}

function randomJumpPairByRange(excludePair = []) {
  const notes = buildNoteRange(store.userRange.low, store.userRange.high).filter(isWhiteKey);
  if (notes.length < 2) return ['C3', 'E3'];
  const excludeKey = excludePair.join(',');
  for (let attempt = 0; attempt < 20; attempt++) {
    const a = Math.floor(Math.random() * notes.length);
    let b = Math.floor(Math.random() * notes.length);
    while (b === a) b = Math.floor(Math.random() * notes.length);
    const pair = [notes[a], notes[b]];
    if (pair.join(',') !== excludeKey) return pair;
  }
  // 20 次都没找到不同的，直接返回
  const a = Math.floor(Math.random() * notes.length);
  let b = Math.floor(Math.random() * notes.length);
  while (b === a) b = Math.floor(Math.random() * notes.length);
  return [notes[a], notes[b]];
}

function transposeNote(note, semitones) {
  const midi = noteToMidi(note);
  return midiToNote(midi + semitones);
}

// 随机邻进/隔音音程生成器
// direction: 'up' | 'down', interval: 1 (邻进，相邻白键) | 2 (隔音，隔一个白键)
function randomIntervalPairByRange(direction, interval, excludePair = []) {
  const allWhite = buildNoteRange(store.userRange.low, store.userRange.high).filter(isWhiteKey);
  if (allWhite.length < 2) return [allWhite[0] || 'C3', allWhite[1] || 'D3'];

  const candidates = [];
  for (let i = 0; i < allWhite.length; i++) {
    const targetIdx = direction === 'up' ? i + interval : i - interval;
    if (targetIdx >= 0 && targetIdx < allWhite.length) {
      candidates.push([allWhite[i], allWhite[targetIdx]]);
    }
  }
  if (!candidates.length) return [allWhite[0], allWhite[1]];

  const excludeKey = excludePair.join(',');
  // 尝试找一个不重复的
  for (let attempt = 0; attempt < 20; attempt++) {
    const pair = candidates[Math.floor(Math.random() * candidates.length)];
    if (pair.join(',') !== excludeKey) return pair;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function transposeNotes(notes) {
  // 高音域模式下，将 C3 区域的硬编码音符上移一个八度
  if (store.vocalMode !== 'high') return notes;
  return notes.map((n) => {
    if (!n) return n; // 保留 null（静音间隔）
    const midi = noteToMidi(n);
    // 只转置 C3-B3 范围内的音（MIDI 48-59）
    if (midi >= 48 && midi <= 59) return transposeNote(n, 12);
    return n;
  });
}

function buildRuntimeTargets(step) {
  runtimeReferenceNotes.value = transposeNotes([...(step.audio.referenceNotes || [])]);
  runtimeTargetNotes.value = transposeNotes([...(step.ui.canvasTargetNotes || [])]);

  if (step.randomWhiteKey) {
    const selected = randomWhiteNoteByRange(runtimeReferenceNotes.value);
    runtimeReferenceNotes.value = [selected];
    runtimeTargetNotes.value = [selected];
  }

  if (step.randomJumpPair) {
    const pair = randomJumpPairByRange(runtimeReferenceNotes.value);
    runtimeReferenceNotes.value = pair;
    runtimeTargetNotes.value = pair;
  }

  if (step.randomInterval) {
    const { direction, interval } = step.randomInterval;
    const pair = randomIntervalPairByRange(direction, interval, runtimeReferenceNotes.value);
    runtimeReferenceNotes.value = pair;
    runtimeTargetNotes.value = pair;
  }
}

async function replayReferenceNotes() {
  const notes = runtimeReferenceNotes.value;
  if (!notes.length) return;
  await audioEngine.playNotes(
    notes,
    notes.length > 8 ? 0.36 : 0.52,
    80,
    (note) => { activePianoNote.value = note || ''; },
  );
}

async function enterStep() {
  const step = currentStep.value;
  if (!step) return;

  store.setMicActive(false);
  audioEngine.stopMic();
  resetStepState();
  buildRuntimeTargets(step);
  showTarget.value = !step.ui.defaultHideTarget;

  if (step.audio.autoPlayOnEnter && runtimeReferenceNotes.value.length) {
    await replayReferenceNotes();
  }
}

function handlePitch(payload) {
  if (!currentStep.value) return;
  const noteInfo = payload.freq ? freqToNote(payload.freq) : null;

  // EMA 平滑：对 MIDI 值做指数移动平均，再转回频率用于绘图
  let smoothedFreq = payload.freq;
  if (payload.freq && payload.freq > 0) {
    const rawMidi = freqToMidi(payload.freq);
    if (smoothedMidi.value === null) {
      smoothedMidi.value = rawMidi;
    } else {
      smoothedMidi.value = SMOOTH_ALPHA * rawMidi + (1 - SMOOTH_ALPHA) * smoothedMidi.value;
    }
    smoothedFreq = midiToFreq(smoothedMidi.value);
  } else {
    smoothedMidi.value = null;
  }

  const smoothedNoteInfo = smoothedFreq ? freqToNote(smoothedFreq) : null;

  pitchPoints.value = prunePoints([
    ...pitchPoints.value,
    { time: payload.time, freq: smoothedFreq, noteName: smoothedNoteInfo?.noteName || '' },
  ]);

  // 钢琴键高亮防抖：同一个音名持续 80ms 才切换，避免反复跳跃
  if (smoothedNoteInfo?.noteName) {
    const candidate = smoothedNoteInfo.noteName;
    if (candidate !== lastPianoNote) {
      lastPianoNote = candidate;
      clearTimeout(pianoDebounceTimer);
      pianoDebounceTimer = setTimeout(() => {
        activePianoNote.value = candidate;
      }, 80);
    }
  }

  // 音域检测步骤：累计有效声音达到 5 秒后自动停止并判定（使用原始频率）
  if (currentStep.value.autoDetectRange && isRecording.value && payload.freq) {
    const now = payload.time;
    if (rangeLastVoicedAt.value > 0) {
      const dt = now - rangeLastVoicedAt.value;
      if (dt < 200) rangeVoicedMs.value += dt;
    }
    rangeLastVoicedAt.value = now;

    if (rangeVoicedMs.value >= RANGE_DETECT_DURATION) {
      detectAndSetRange();
      store.setMicActive(false);
      audioEngine.stopMic();
    }
  }
}

function handleVolume(payload) {
  lastVolume.value = payload.rms;
  volumePoints.value = prunePoints([
    ...volumePoints.value,
    { time: payload.time, rms: payload.rms },
  ]);
}

function detectAndSetRange() {
  const validFreqs = pitchPoints.value
    .filter((p) => Number.isFinite(p.freq) && p.freq > 0)
    .map((p) => p.freq);
  if (validFreqs.length < 10) return;
  const avg = validFreqs.reduce((s, f) => s + f, 0) / validFreqs.length;
  const range = mapUserRangeByAvgFreq(avg);
  store.setUserRange(range);
  hintMessage.value = `建议选择 ${range.low} - ${range.high} 音域`;
}

function nextStep() {
  const step = currentStep.value;
  if (step?.autoDetectRange && pitchPoints.value.length > 0) detectAndSetRange();

  store.setMicActive(false);
  audioEngine.stopMic();

  if (currentStepIndex.value < totalSteps.value - 1) {
    currentStepIndex.value += 1;
    return;
  }
  emit('level-complete', props.levelConfig.id);
}

function handleNextLevel() {
  store.setMicActive(false);
  audioEngine.stopMic();
  emit('level-complete', props.levelConfig.id);
}

function prevStep() {
  store.setMicActive(false);
  audioEngine.stopMic();
  if (currentStepIndex.value > 0) currentStepIndex.value -= 1;
}

async function handleRandomize() {
  store.setMicActive(false);
  audioEngine.stopMic();
  resetStepState();
  const step = currentStep.value;
  if (!step) return;
  buildRuntimeTargets(step);
  if (runtimeReferenceNotes.value.length) await replayReferenceNotes();
}

function handleToggleTarget(checked) {
  showTarget.value = checked;
}

async function handleToggleRecording() {
  const step = currentStep.value;
  if (!step || !step.audio.enableMic) return;

  if (isRecording.value) {
    store.setMicActive(false);
    audioEngine.stopMic();
    return;
  }

  pitchPoints.value = [];
  volumePoints.value = [];
  hintMessage.value = '';
  rangeVoicedMs.value = 0;
  rangeLastVoicedAt.value = 0;
  smoothedMidi.value = null;
  lastPianoNote = '';

  await audioEngine.ensureStarted();
  store.setMicActive(true);

  try {
    await audioEngine.startMic();
  } catch (error) {
    hintMessage.value = '麦克风启动失败，请检查浏览器权限设置。';
    store.setMicActive(false);
  }
}

async function handleReplay() {
  await replayReferenceNotes();
}

async function handlePianoClick(note) {
  activePianoNote.value = note;
  await audioEngine.playNote(note, 0.68);
}

watch(() => props.levelConfig.id, async () => {
  currentStepIndex.value = 0;
  await enterStep();
});

watch(() => currentStepIndex.value, async () => {
  await enterStep();
});

// 切换音域模式时：停止录音、清空状态、重建目标
watch(() => store.vocalMode, async () => {
  store.setMicActive(false);
  audioEngine.stopMic();
  resetStepState();
  smoothedMidi.value = null;
  lastPianoNote = '';
  const step = currentStep.value;
  if (!step) return;
  buildRuntimeTargets(step);
  showTarget.value = !step.ui.defaultHideTarget;
});

onMounted(async () => {
  audioEngine.setPitchCallback(handlePitch);
  audioEngine.setVolumeCallback(handleVolume);
  await enterStep();
});

onBeforeUnmount(() => {
  clearTimeout(pianoDebounceTimer);
  audioEngine.stopMic();
  audioEngine.setPitchCallback(null);
  audioEngine.setVolumeCallback(null);
});
</script>

<style scoped>
.runner-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 16px;
  min-height: 0;
  height: 100%;
}

.left-panel {
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  background: #FFFFFF;
  padding: 12px;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.left-panel .visual-row {
  flex: 1;
}

.visual-row {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 10px;
}

.piano-slot {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.piano-main {
  flex: 1;
}

.piano-placeholder {
  width: 140px;
  min-height: 600px;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  background: #F8FAFC;
}

.canvas-slot {
  display: grid;
}

.canvas-wrap { }

.canvas-placeholder {
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  color: #94A3B8;
  display: grid;
  place-items: center;
  background: #F8FAFC;
}

.right-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
