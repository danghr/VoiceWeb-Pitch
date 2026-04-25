const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** 琴键与画布每个音高格子的固定高度（px）。PianoRoll / CanvasRenderer 必须共用此值以保证纵轴对齐。 */
export const PIANO_KEY_HEIGHT = 20;

/** 音高画布总高度（px）= (D5 - A2 + 1) × PIANO_KEY_HEIGHT。与 PianoRoll 总高度一致。 */
export const PIANO_CANVAS_HEIGHT = ((5 + 1) * 12 + 2 - ((2 + 1) * 12 + 9) + 1) * PIANO_KEY_HEIGHT;

export function noteToMidi(noteName) {
  const match = /^([A-G])(#?)(-?\d)$/.exec(noteName);
  if (!match) {
    throw new Error(`无效音名: ${noteName}`);
  }

  const [, letter, sharp, octaveRaw] = match;
  const octave = Number(octaveRaw);
  const note = `${letter}${sharp}`;
  const index = NOTE_ORDER.indexOf(note);

  if (index < 0) {
    throw new Error(`无效音名: ${noteName}`);
  }

  return (octave + 1) * 12 + index;
}

export function midiToNote(midi) {
  const rounded = Math.round(midi);
  const octave = Math.floor(rounded / 12) - 1;
  const note = NOTE_ORDER[((rounded % 12) + 12) % 12];
  return `${note}${octave}`;
}

export function midiToFreq(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

export function noteToFreq(noteName) {
  return midiToFreq(noteToMidi(noteName));
}

export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

export function centsBetween(freq, targetFreq) {
  return 1200 * Math.log2(freq / targetFreq);
}

export function freqToNote(freq) {
  if (!Number.isFinite(freq) || freq <= 0) {
    return null;
  }

  const midiFloat = freqToMidi(freq);
  const midiRounded = Math.round(midiFloat);
  const noteName = midiToNote(midiRounded);
  const idealFreq = midiToFreq(midiRounded);
  const cents = centsBetween(freq, idealFreq);

  return {
    midi: midiRounded,
    midiFloat,
    noteName,
    cents,
    freq,
  };
}

export function isWhiteKey(noteName) {
  return !noteName.includes('#');
}

export function buildNoteRange(startNote, endNote) {
  const start = noteToMidi(startNote);
  const end = noteToMidi(endNote);
  const result = [];

  for (let midi = Math.min(start, end); midi <= Math.max(start, end); midi += 1) {
    result.push(midiToNote(midi));
  }

  return result;
}
