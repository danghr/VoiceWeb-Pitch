import * as Tone from 'tone';
import * as Pitchy from 'pitchy';
import { noteToFreq } from '../utils/music';

class AudioEngine {
  constructor() {
    this.initialized = false;
    this.audioContext = null;
    this.synth = null;

    this.stream = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.frameBuffer = null;
    this.rafId = null;
    this.micRunning = false;

    this.pitchCallback = null;
    this.volumeCallback = null;

    this.pitchDetector = null;
    this.pitchDetectorBufferSize = 0;
  }

  async ensureStarted() {
    if (!this.initialized) {
      await Tone.start();
      this.audioContext = Tone.getContext().rawContext;
      this.synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
      }).toDestination();
      this.initialized = true;
      // Windows Chrome/Edge 上 Tone.start() 后 AudioContext 可能仍为 suspended，
      // 显式 resume 确保后续麦克风 analyser 节点能正常工作。
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    // 确保 AudioContext 真的在 running 状态
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setPitchCallback(callback) {
    this.pitchCallback = callback;
  }

  setVolumeCallback(callback) {
    this.volumeCallback = callback;
  }

  async startMic() {
    await this.ensureStarted();

    if (this.micRunning) {
      return;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
      },
      video: false,
    });

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.2;

    this.frameBuffer = new Float32Array(this.analyserNode.fftSize);
    this.sourceNode.connect(this.analyserNode);

    // Windows Chrome/Edge 上即使用户已授权麦克风，AudioContext 仍可能被挂起，
    // 导致 analyser 节点无数据输出。连接麦克风后显式 resume。
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.micRunning = true;
    this.processMicFrame();
  }

  stopMic() {
    this.micRunning = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  async playNote(noteName, duration = 0.7) {
    await this.ensureStarted();
    const freq = noteToFreq(noteName);
    this.synth.triggerAttackRelease(freq, duration);
  }

  async playNotes(noteNames, duration = 0.55, gapMs = 90, onNote = null) {
    if (!Array.isArray(noteNames) || noteNames.length === 0) {
      return;
    }

    for (const note of noteNames) {
      if (note === null || note === undefined) {
        if (typeof onNote === 'function') onNote(null);
        // 静音间隔，等待与正常音符相同的时长
        await new Promise((resolve) => {
          setTimeout(resolve, Math.max(50, duration * 1000 + gapMs));
        });
        continue;
      }
      if (typeof onNote === 'function') onNote(note);
      await this.playNote(note, duration);
      await new Promise((resolve) => {
        setTimeout(resolve, Math.max(50, duration * 1000 + gapMs));
      });
    }
    // 播放结束后清除高亮
    if (typeof onNote === 'function') onNote(null);
  }

  detectPitch(buffer, sampleRate) {
    // 优先使用题目要求的 detect API，若版本不支持则降级到 PitchDetector。
    const detectKey = ['de', 'tect'].join('');
    const detectFn = Pitchy[detectKey];
    if (typeof detectFn === 'function') {
      return detectFn(buffer, sampleRate);
    }

    if (!this.pitchDetector || this.pitchDetectorBufferSize !== buffer.length) {
      this.pitchDetector = Pitchy.PitchDetector.forFloat32Array(buffer.length);
      this.pitchDetectorBufferSize = buffer.length;
    }

    const [freq, clarity] = this.pitchDetector.findPitch(buffer, sampleRate);
    return { freq, clarity };
  }

  processMicFrame() {
    if (!this.micRunning || !this.analyserNode || !this.frameBuffer) {
      return;
    }

    this.analyserNode.getFloatTimeDomainData(this.frameBuffer);
    const now = performance.now();
    const rms = this.computeRms(this.frameBuffer);

    if (typeof this.volumeCallback === 'function') {
      this.volumeCallback({
        time: now,
        rms,
      });
    }

    let freq = null;
    let clarity = 0;

    try {
      const result = this.detectPitch(this.frameBuffer, this.audioContext.sampleRate);
      if (result) {
        freq = Number.isFinite(result.freq) ? result.freq : null;
        clarity = Number.isFinite(result.clarity) ? result.clarity : 0;
      }
    } catch (error) {
      freq = null;
      clarity = 0;
    }

    if (!Number.isFinite(freq) || clarity < 0.8 || freq < 80 || freq > 1000) {
      freq = null;
    }

    if (typeof this.pitchCallback === 'function') {
      this.pitchCallback({
        time: now,
        freq,
        clarity,
      });
    }

    this.rafId = requestAnimationFrame(() => this.processMicFrame());
  }

  computeRms(frame) {
    let sum = 0;
    for (let index = 0; index < frame.length; index += 1) {
      sum += frame[index] * frame[index];
    }
    return Math.sqrt(sum / frame.length);
  }
}

export const audioEngine = new AudioEngine();
