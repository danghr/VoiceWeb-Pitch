<template>
  <div class="canvas-shell">
    <canvas ref="canvasRef" class="pitch-canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { freqToMidi, noteToFreq, noteToMidi } from '../utils/music';

const props = defineProps({
  pitchPoints: {
    type: Array,
    default: () => [],
  },
  volumePoints: {
    type: Array,
    default: () => [],
  },
  targetNotes: {
    type: Array,
    default: () => [],
  },
});

const canvasRef = ref(null);
let resizeObserver = null;

const MIN_FREQ = noteToFreq('A2');
const MAX_FREQ = noteToFreq('D5');
const MIN_MIDI = noteToMidi('A2');
const MAX_MIDI = noteToMidi('D5');
const NOTE_COUNT = MAX_MIDI - MIN_MIDI + 1;
const WINDOW_MS = 15000;

function mapTimeToX(time, windowStart, width) {
  return ((time - windowStart) / WINDOW_MS) * width;
}

function mapFreqToY(freq, height) {
  const midi = Math.min(MAX_MIDI, Math.max(MIN_MIDI, freqToMidi(freq)));
  const indexFromTop = MAX_MIDI - midi;
  return ((indexFromTop + 0.5) / NOTE_COUNT) * height;
}

function drawGrid() {
  // 不再绘制默认横线，仅保留 drawTargets 中的辅助线
}

function drawTargets(context, width, height) {
  if (!props.targetNotes.length) {
    return;
  }

  context.save();
  context.setLineDash([8, 8]);
  context.strokeStyle = '#9CA3AF';
  context.fillStyle = '#6B7280';
  context.font = '12px Avenir Next, PingFang SC, sans-serif';

  props.targetNotes.forEach((note) => {
    const y = mapFreqToY(noteToFreq(note), height);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
    context.fillText(note, 8, Math.max(12, y - 6));
  });

  context.restore();
}

function drawVolume(context, width, height, windowStart, windowEnd) {
  const points = props.volumePoints.filter((point) => point.time >= windowStart && point.time <= windowEnd);
  if (!points.length) {
    return;
  }

  const firstX = mapTimeToX(points[0].time, windowStart, width);
  const lastX = mapTimeToX(points[points.length - 1].time, windowStart, width);

  context.save();
  context.fillStyle = 'rgba(249, 115, 22, 0.3)';
  context.beginPath();
  context.moveTo(firstX, height);

  points.forEach((point, index) => {
    const x = mapTimeToX(point.time, windowStart, width);
    const normalized = Math.min(1, point.rms / 0.12);
    const y = height - normalized * (height * 0.35);
    if (index === 0) {
      context.lineTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.lineTo(lastX, height);
  context.closePath();
  context.fill();
  context.restore();
}

function drawPitch(context, width, height, windowStart, windowEnd) {
  const validPoints = props.pitchPoints.filter(
    (point) => Number.isFinite(point.freq) && point.time >= windowStart && point.time <= windowEnd,
  );
  if (!validPoints.length) {
    return;
  }

  context.save();
  context.strokeStyle = '#2563EB';
  context.lineWidth = 2.5;
  context.beginPath();

  validPoints.forEach((point, index) => {
    const x = mapTimeToX(point.time, windowStart, width);
    const y = mapFreqToY(point.freq, height);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.stroke();

  const last = validPoints[validPoints.length - 1];
  const lastX = mapTimeToX(last.time, windowStart, width);
  const lastY = mapFreqToY(last.freq, height);

  context.fillStyle = '#EF4444';
  context.beginPath();
  context.arc(lastX, lastY, 5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function render() {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);

  const context = canvas.getContext('2d');
  context.scale(devicePixelRatio, devicePixelRatio);

  const width = rect.width;
  const height = rect.height;

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#F8FAFC';
  context.fillRect(0, 0, width, height);

  drawGrid();

  const allTimes = [...props.pitchPoints.map((point) => point.time), ...props.volumePoints.map((point) => point.time)];
  const earliest = allTimes.length ? Math.min(...allTimes) : performance.now();
  const latest = allTimes.length ? Math.max(...allTimes) : performance.now();

  let windowStart = earliest;
  let windowEnd = earliest + WINDOW_MS;

  if (latest - earliest > WINDOW_MS) {
    windowEnd = latest;
    windowStart = latest - WINDOW_MS;
  }

  drawVolume(context, width, height, windowStart, windowEnd);
  drawTargets(context, width, height);
  drawPitch(context, width, height, windowStart, windowEnd);
}

function clear() {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function snapshot() {
  if (!canvasRef.value) {
    return '';
  }
  return canvasRef.value.toDataURL('image/png');
}

defineExpose({
  clear,
  snapshot,
});

onMounted(() => {
  render();
  resizeObserver = new ResizeObserver(() => {
    render();
  });
  resizeObserver.observe(canvasRef.value);
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

watch(
  () => [props.pitchPoints, props.volumePoints, props.targetNotes],
  () => {
    render();
  },
  { deep: true },
);
</script>

<style scoped>
.canvas-shell {
  width: 100%;
  height: 100%;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  background: #F8FAFC;
}

.pitch-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
