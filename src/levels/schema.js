/**
 * @typedef {Object} LevelConfig
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {StepConfig[]} steps
 *
 * @typedef {Object} StepConfig
 * @property {string} id
 * @property {string} title
 * @property {string} instruction
 * @property {Object} audio
 * @property {boolean} audio.enableMic
 * @property {string[]} [audio.referenceNotes]
 * @property {boolean} [audio.autoPlayOnEnter]
 * @property {boolean} [audio.playOnPianoClick]
 * @property {Object} ui
 * @property {boolean} ui.showPiano
 * @property {string[]} [ui.pianoHighlightNotes]
 * @property {boolean} ui.showPitchCanvas
 * @property {string[]} [ui.canvasTargetNotes]
 * @property {boolean} [ui.showVolumeBar]
 * @property {boolean} [ui.showNextButton]
 * @property {boolean} [ui.showReplayButton]
 * @property {boolean} [ui.hideCanvasTargetUntilDone]
 * @property {Object} validator
 * @property {'manual'|'sustain'|'match'|'slide'|'jump'|'melody'} validator.type
 * @property {Record<string, any>} validator.params
 * @property {string} validator.successMessage
 * @property {string} [validator.hintMessage]
 * @property {'manual'|'auto'|'validation-pass'} nextStepTrigger
 */

export {};
