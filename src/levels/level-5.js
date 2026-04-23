const melodySequence = ['C3', 'C3', 'G3', 'G3', 'A3', 'A3', 'G3', null, 'F3', 'F3', 'E3', 'E3', 'D3', 'D3', 'C3'];
const melodyNotes = [...new Set(melodySequence.filter(Boolean))];

/** @type {import('./schema').LevelConfig} */
const level5 = {
  id: 'level-5',
  title: '关卡 5',
  subtitle: '你的第一句旋律',
  melodySequence,
  steps: [
    {
      id: 'intro',
      title: '本关说明',
      instruction: `
<p><b>学习目标</b></p>
<ul>
  <li>将多个音程连接成一句连贯旋律。</li>
</ul>
<p><b>练习内容</b></p>
<p>上一关建立了你对音程的感知和控制能力。本关在此基础上，训练你把多个音连接成一句连贯的旋律。</p>
<p><b>曲目：</b>《小星星》（前两句）</p>
<p style="text-align:center;font-size:18px;letter-spacing:2px;">| 1 1 5 5 | 6 6 5 — | 4 4 3 3 | 2 2 1 — |</p>
<p><b>简谱映射（C 大调）：</b>1=C3, 2=D3, 3=E3, 4=F3, 5=G3, 6=A3, 7=B3</p>
<p>准备好后，点击“下一步”开始练习。</p>`,
      audio: { enableMic: false },
      ui: { showPiano: false, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'melody-high',
      title: '高辅助旋律',
      instruction: `
<p><b>高辅助模式：</b>系统将逐音播放参考音，并在画布上显示所有目标线。请跟随演唱。</p>
<p><b>方法：</b>听一个音唱一个音，熟悉后听两个音唱两个音。</p>
<p><b>完成标准：</b>能跟随参考音逐音演唱，音高线大致落在对应目标线上。</p>
<p><b>曲目：</b>《小星星》（前两句）</p>
<p style="text-align:center;font-size:18px;letter-spacing:2px;">| 1 1 5 5 | 6 6 5 — | 4 4 3 3 | 2 2 1 — |</p>
<p><b>简谱映射（C 大调）：</b>1=C3, 2=D3, 3=E3, 4=F3, 5=G3, 6=A3, 7=B3</p>`,
      audio: {
        enableMic: true,
        referenceNotes: melodySequence,
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        pianoHighlightNotes: melodyNotes,
        showPitchCanvas: true,
        canvasTargetNotes: melodyNotes,
        showReplayButton: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'melody-mid',
      title: '中辅助旋律',
      instruction: `
<p><b>中辅助模式：</b>只播放第一个音，你凭记忆演唱后续音符。目标线仍然显示供参考。</p>
<p><b>方法：</b>听完第一个音后找到音高，随后凭记忆演唱后续音。允许短时间的音高寻找，避免全程滑音。检查音高线位置确认每个音是否正确。</p>
<p><b>完成标准：</b>仅听起始音后，能凭记忆完成整句旋律，音高线大致落在正确位置。</p>
<p><b>曲目：</b>《小星星》（前两句）</p>
<p style="text-align:center;font-size:18px;letter-spacing:2px;">| 1 1 5 5 | 6 6 5 — | 4 4 3 3 | 2 2 1 — |</p>
<p><b>简谱映射（C 大调）：</b>1=C3, 2=D3, 3=E3, 4=F3, 5=G3, 6=A3, 7=B3</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>停播后就忘记音高：</b>这是正常的依赖现象。停播后先唱第一个音，并观察音高线是否仍在该位置，确认后再唱第二个音，逐步减少依赖。</li>
</ul>`,
      audio: {
        enableMic: true,
        referenceNotes: [melodySequence[0]],
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        pianoHighlightNotes: melodyNotes,
        showPitchCanvas: true,
        canvasTargetNotes: melodyNotes,
        showReplayButton: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'melody-low',
      title: '低辅助旋律',
      instruction: `
<p><b>低辅助模式：</b>仅给起始音，全程隐藏目标线和键盘。唱完后可手动开启“参考线与键盘”复盘。</p>
<p><b>方法：</b>凭记忆和听觉完成整句旋律，唱完后核对。</p>
<p><b>完成标准：</b>能完整、准确唱出 C 大调的《小星星》前两句。音高线大致落在正确的白键位置上。若偶尔偏差半音但能迅速修正，亦视为达标。</p>
<p><b>曲目：</b>《小星星》（前两句）</p>
<p style="text-align:center;font-size:18px;letter-spacing:2px;">| 1 1 5 5 | 6 6 5 — | 4 4 3 3 | 2 2 1 — |</p>
<p><b>简谱映射（C 大调）：</b>1=C3, 2=D3, 3=E3, 4=F3, 5=G3, 6=A3, 7=B3</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>唱到后面整体偏低或偏高：</b>每唱完一句回头检查尾音是否仍在正确位置。若漂移严重，返回关卡 3、4 加强单音及音程的感知。</li>
</ul>
<p>恭喜你完成了全部五个关卡的训练！继续保持练习，音准会越来越好。</p>`,
      audio: {
        enableMic: true,
        referenceNotes: [melodySequence[0]],
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        pianoHighlightNotes: melodyNotes,
        showPitchCanvas: true,
        canvasTargetNotes: melodyNotes,
        showReplayButton: true,
        defaultHideTarget: true,
        allowToggleTarget: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
  ],
};

export default level5;
