import { centsBetween, freqToMidi, midiToFreq, noteToFreq, noteToMidi } from '../utils/music';

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDeviation(values) {
  if (values.length < 2) {
    return 0;
  }
  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance);
}

export class Validator {
  constructor() {
    this.eventTarget = new EventTarget();
    this.reset();
  }

  on(eventName, handler) {
    const listener = (event) => handler(event.detail);
    this.eventTarget.addEventListener(eventName, listener);
    return () => this.eventTarget.removeEventListener(eventName, listener);
  }

  emit(eventName, detail = {}) {
    this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  reset() {
    this.step = null;
    this.context = {};
    this.startedAt = 0;
    this.lastSampleTime = 0;
    this.passed = false;
    this.failed = false;
    this.lastHintAt = 0;

    this.sustainSamples = [];
    this.sustainStartAt = 0;
    this.sustainVoicedMs = 0;
    this.sustainLastVoicedAt = 0;

    this.matchHoldStart = 0;

    this.slideStartedVoiceAt = 0;
    this.slideLastVoicedAt = 0;
    this.slideReachedHigh = false;

    this.jumpFoundFrom = false;
    this.jumpFoundFromAt = 0;
    this.jumpMidSlideMs = 0;

    this.melodyIndex = 0;
    this.melodyHoldStart = 0;
    this.melodyNoteStartAt = 0;
  }

  configure(step, context = {}) {
    this.reset();
    this.step = step;
    this.context = context;
    this.startedAt = performance.now();
  }

  update(sample) {
    if (!this.step || this.passed || this.failed) {
      return;
    }

    this.lastSampleTime = sample.time;

    switch (this.step.validator.type) {
      case 'manual':
        return;
      case 'sustain':
        this.handleSustain(sample);
        return;
      case 'match':
        this.handleMatch(sample);
        return;
      case 'slide':
        this.handleSlide(sample);
        return;
      case 'jump':
        this.handleJump(sample);
        return;
      case 'melody':
        this.handleMelody(sample);
        return;
      default:
        return;
    }
  }

  manualPass() {
    if (this.passed || this.failed) {
      return;
    }
    this.passed = true;
    this.emit('step-pass', {
      message: this.step?.validator?.successMessage,
    });
  }

  fail(message) {
    if (this.failed || this.passed) {
      return;
    }
    this.failed = true;
    this.emit('step-fail', { message });
  }

  pass(extra = {}) {
    if (this.failed || this.passed) {
      return;
    }
    this.passed = true;
    this.emit('step-pass', {
      message: this.step?.validator?.successMessage,
      ...extra,
    });
  }

  hint(message) {
    const now = performance.now();
    if (now - this.lastHintAt < 800) {
      return;
    }
    this.lastHintAt = now;
    this.emit('hint', { message });
  }

  resolveMatchTargets() {
    const params = this.step.validator.params || {};
    if (Array.isArray(params.targetNotes) && params.targetNotes.length) {
      return params.targetNotes;
    }
    if (params.targetNote) {
      return [params.targetNote];
    }
    if (typeof this.context.getRuntimeTargets === 'function') {
      const runtimeTargets = this.context.getRuntimeTargets();
      if (Array.isArray(runtimeTargets) && runtimeTargets.length) {
        return runtimeTargets;
      }
    }
    if (Array.isArray(this.step.ui?.canvasTargetNotes) && this.step.ui.canvasTargetNotes.length) {
      return this.step.ui.canvasTargetNotes;
    }
    return [];
  }

  handleSustain(sample) {
    const params = this.step.validator.params || {};
    const durationMs = params.durationMs ?? 2000;
    const threshold = params.stabilityCents ?? 120;
    const timeoutMs = params.timeoutMs ?? 0;
    const minVolume = params.minVolume ?? 0.004;
    const maxGapMs = params.maxGapMs ?? 400;

    if (timeoutMs > 0 && sample.time - this.startedAt > timeoutMs) {
      this.fail(this.step.validator.hintMessage || '未检测到稳定发声，请点击 Start 后重试。');
      return;
    }

    const hasValidPitch = Boolean(sample.freq) && sample.volume >= minVolume;

    if (!hasValidPitch) {
      // 长时间静音则清空滑动窗口
      if (this.sustainLastVoicedAt && sample.time - this.sustainLastVoicedAt > maxGapMs) {
        this.sustainSamples = [];
      }
      return;
    }

    this.sustainLastVoicedAt = sample.time;

    // 滑动窗口：保留最近 durationMs * 2 范围内的采样
    this.sustainSamples.push({ time: sample.time, freq: sample.freq });
    const windowStart = sample.time - durationMs * 2;
    while (this.sustainSamples.length > 0 && this.sustainSamples[0].time < windowStart) {
      this.sustainSamples.shift();
    }

    // 取最近 durationMs 内的采样来判断稳定性
    const recentCutoff = sample.time - durationMs;
    const recentSamples = this.sustainSamples.filter((s) => s.time >= recentCutoff);

    // 至少需要一定数量的采样点（约 durationMs / 30ms 帧率的一半）
    const minSampleCount = Math.max(8, Math.floor(durationMs / 60));
    if (recentSamples.length < minSampleCount) {
      return;
    }

    // 用 MIDI 值计算标准差（1 MIDI = 1 semitone = 100 cents）
    const midiValues = recentSamples.map((s) => freqToMidi(s.freq));
    const std = stdDeviation(midiValues);
    const stdCents = std * 100;

    if (stdCents <= threshold) {
      const freqs = recentSamples.map((s) => s.freq);
      this.pass({
        avgFreq: average(freqs),
        std: stdCents,
      });
      return;
    }
  }

  handleMatch(sample) {
    const params = this.step.validator.params || {};
    const targets = this.resolveMatchTargets();
    const tolerance = params.toleranceCents ?? 50;
    const requireSustain = params.requireSustain ?? true;
    const sustainMs = params.sustainMs ?? (requireSustain ? 1200 : 0);
    const timeoutMs = params.timeoutMs ?? 0;

    if (timeoutMs && sample.time - this.startedAt > timeoutMs) {
      this.fail(this.step.validator.hintMessage || '未在限定时间内靠近目标音，请重试。');
      return;
    }

    if (!sample.freq || sample.volume < 0.008 || !targets.length) {
      this.matchHoldStart = 0;
      return;
    }

    let nearest = null;
    let nearestCents = Number.POSITIVE_INFINITY;

    for (const note of targets) {
      const cents = Math.abs(centsBetween(sample.freq, noteToFreq(note)));
      if (cents < nearestCents) {
        nearestCents = cents;
        nearest = note;
      }
    }

    if (nearestCents > tolerance) {
      this.matchHoldStart = 0;
      return;
    }

    if (!requireSustain || sustainMs <= 0) {
      this.pass({ matchedNote: nearest });
      return;
    }

    if (!this.matchHoldStart) {
      this.matchHoldStart = sample.time;
      return;
    }

    if (sample.time - this.matchHoldStart >= sustainMs) {
      this.pass({ matchedNote: nearest });
    }
  }

  handleSlide(sample) {
    const params = this.step.validator.params || {};
    const range = this.context.userRange || { low: 'C3', high: 'A3' };
    const low = noteToFreq(range.low);
    const high = noteToFreq(range.high);
    const minDurationMs = params.minDurationMs ?? 2000;
    const timeoutMs = params.timeoutMs ?? 12000;

    if (sample.time - this.startedAt > timeoutMs) {
      this.fail(this.step.validator.hintMessage || '超时未完成往返滑音，请重试。');
      return;
    }

    if (!sample.freq || sample.volume < 0.008) {
      if (this.slideStartedVoiceAt && sample.time - this.slideLastVoicedAt > 220) {
        this.fail(this.step.validator.hintMessage || '滑音出现断裂，请保持连续气息。');
      }
      return;
    }

    if (!this.slideStartedVoiceAt) {
      this.slideStartedVoiceAt = sample.time;
    }

    this.slideLastVoicedAt = sample.time;

    if (!this.slideReachedHigh && sample.freq >= high * 0.95) {
      this.slideReachedHigh = true;
    }

    if (this.slideReachedHigh && sample.freq <= low * 1.06) {
      const duration = sample.time - this.slideStartedVoiceAt;
      if (duration >= minDurationMs) {
        this.pass({ duration });
      }
    }
  }

  handleJump(sample) {
    const params = this.step.validator.params || {};
    const tolerance = params.toleranceCents ?? 70;
    const fromFreq = noteToFreq(params.from);
    const toFreq = noteToFreq(params.to);
    const maxSearchMs = params.maxSearchMs ?? 2000;
    const banSlide = params.banSlide ?? false;

    if (!sample.freq || sample.volume < 0.008) {
      return;
    }

    const toCents = Math.abs(centsBetween(sample.freq, toFreq));
    const fromCents = Math.abs(centsBetween(sample.freq, fromFreq));

    if (!this.jumpFoundFrom) {
      if (fromCents <= tolerance) {
        this.jumpFoundFrom = true;
        this.jumpFoundFromAt = sample.time;
      }
      return;
    }

    if (sample.time - this.jumpFoundFromAt > maxSearchMs) {
      this.fail(this.step.validator.hintMessage || '跳进目标音超时，请缩短寻找过程。');
      return;
    }

    if (toCents <= tolerance) {
      this.pass({ duration: sample.time - this.jumpFoundFromAt });
      return;
    }

    if (banSlide) {
      const fromMidi = noteToMidi(params.from);
      const toMidi = noteToMidi(params.to);
      const lowMidi = Math.min(fromMidi, toMidi);
      const highMidi = Math.max(fromMidi, toMidi);
      const midi = freqToMidi(sample.freq);
      const dt = Math.max(0, sample.time - (this._jumpLastSampleAt || sample.time));
      this._jumpLastSampleAt = sample.time;

      if (midi > lowMidi + 0.15 && midi < highMidi - 0.15) {
        this.jumpMidSlideMs += dt;
      }

      if (this.jumpMidSlideMs > 400) {
        this.fail(this.step.validator.hintMessage || '检测到连续滑音，请尝试直接跳到目标音。');
      }
    }
  }

  handleMelody(sample) {
    const params = this.step.validator.params || {};
    const notes = typeof this.context.resolveMelodyNotes === 'function'
      ? this.context.resolveMelodyNotes(params.notes)
      : [];

    if (!notes.length || this.melodyIndex >= notes.length) {
      return;
    }

    const tolerance = params.toleranceCents ?? 100;
    const holdMs = params.holdMs ?? 450;
    const perNoteTimeoutMs = params.perNoteTimeoutMs ?? 2800;

    if (!this.melodyNoteStartAt) {
      this.melodyNoteStartAt = sample.time;
    }

    if (sample.time - this.melodyNoteStartAt > perNoteTimeoutMs) {
      this.fail(this.step.validator.hintMessage || '旋律中有音符未及时命中，请重新尝试。');
      return;
    }

    if (!sample.freq || sample.volume < 0.007) {
      this.melodyHoldStart = 0;
      return;
    }

    const target = notes[this.melodyIndex];
    const targetFreq = noteToFreq(target);
    const cents = Math.abs(centsBetween(sample.freq, targetFreq));

    if (cents > tolerance) {
      this.melodyHoldStart = 0;
      return;
    }

    if (!this.melodyHoldStart) {
      this.melodyHoldStart = sample.time;
      return;
    }

    if (sample.time - this.melodyHoldStart >= holdMs) {
      this.emit('melody-progress', {
        index: this.melodyIndex,
        note: target,
      });
      this.melodyIndex += 1;
      this.melodyHoldStart = 0;
      this.melodyNoteStartAt = sample.time;

      if (this.melodyIndex >= notes.length) {
        this.pass({
          matchedCount: notes.length,
        });
      }
    }
  }
}
