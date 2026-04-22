<template>
  <section class="piano-roll">
    <div class="key-layer" :style="layerStyle">
      <button
        v-for="note in displayNotes"
        :key="note"
        class="piano-key"
        :class="keyClass(note)"
        :disabled="disabled"
        @click="$emit('note-click', note)"
      >
        <span class="label">{{ note }}</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { buildNoteRange, isWhiteKey } from '../utils/music';

const props = defineProps({
  highlightNotes: {
    type: Array,
    default: () => [],
  },
  activeNote: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['note-click']);

const fullRange = computed(() => buildNoteRange('A2', 'D5'));
const displayNotes = computed(() => [...fullRange.value].reverse());
const layerStyle = computed(() => ({
  gridTemplateRows: `repeat(${displayNotes.value.length}, minmax(0, 1fr))`,
}));

function keyClass(note) {
  return {
    'is-white': isWhiteKey(note),
    'is-black': !isWhiteKey(note),
    'is-highlight': props.highlightNotes.includes(note),
    'is-active': props.activeNote === note,
  };
}
</script>

<style scoped>
.piano-roll {
  width: 140px;
  height: 100%;
  position: relative;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
}

.key-layer {
  display: grid;
  height: 100%;
}

.piano-key {
  min-height: 0;
  border: none;
  box-shadow: inset 0 -1px #E5E7EB;
  position: relative;
  cursor: pointer;
  text-align: left;
  padding-left: 8px;
  display: flex;
  align-items: center;
}

.piano-key.is-white {
  background: #FFFFFF;
  color: #334155;
}

.piano-key.is-black {
  background: #1F2937;
  color: #E2E8F0;
  width: 86px;
  margin-left: auto;
  border-radius: 8px 0 0 8px;
  box-shadow: inset 0 -1px rgba(255, 255, 255, 0.12);
}

.label {
  font-size: 11px;
  letter-spacing: 0.2px;
}

.piano-key.is-highlight {
  background: #DBEAFE;
  color: #1E3A8A;
}

.piano-key.is-active {
  background: #2563EB;
  color: #FFFFFF;
}
</style>
