/** @type {import('./schema').LevelConfig} */
const level1 = {
  id: 'level-1',
  title: '关卡 1',
  subtitle: '认识工具、音域与音名',
  steps: [
    {
      id: 'intro',
      title: '开始之前',
      instruction: `
<p>欢迎使用“音准训练器”！这是一个帮助你从零开始建立基本音准概念的分步骤训练工具。每个关卡包含多个练习步骤，逐步引导你建立唱歌的基础能力。</p>
<p><b>学习目标</b></p>
<ul>
  <li>学会在钢琴窗格中定位所需的音高。</li>
  <li>通过自然发声确定个人舒适音域，用于后续训练。</li>
</ul>
<p><b>准备工作</b></p>
<ul>
  <li>请使用电脑或平板电脑，确保有足够大的屏幕。</li>
  <li><b>必须佩戴耳机。</b>扬声器播放的参考音如果被麦克风录入，会导致音高曲线混乱。耳机可以让麦克风只接收你的人声。</li>
  <li>若使用降噪耳机，建议关闭降噪功能。唱歌时你听到的自己的声音是骨传导与空气传导的混合；降噪会过滤空气传导部分，干扰音准判断。</li>
</ul>
<p><b>使用原则</b></p>
<ul>
  <li>不训练绝对音感。练习始终围绕“听到参考音后进行复制”。</li>
  <li>强调闭环。每关练习都要完成“听、唱、看、调”四步，最终摆脱“看”的过程，建立音准感知。</li>
</ul>
<p>准备好后，点击“下一步”开始。</p>`,
      audio: { enableMic: false },
      ui: { showPiano: false, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'range-test',
      title: '舒适音域测试',
      instruction: `
<p>点击 Start，用日常说话最自然的状态发一个拉长的“啊——”（不刻意压低，不捏尖嗓子）。你会观察到画布上显示了一条随时间前进的蓝色折线，它表示你发声的音高随时间的变化。</p>
<p>累计约 5 秒有效声音后系统将自动停止并推荐音域设定。此时你可按照推荐或自身习惯，在页面顶部手动切换音域模式。如果后续发现音域不合适，也可随时切换。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>音高线不出现或乱跳：</b>在点击 Start 之后立即发声；靠近麦克风；将“啊——”拉长、拉平；避免使用爆破音（如“吧”“啪”）；检查耳机是否漏音。</li>
  <li><b>不确定自己属于哪个音域：</b>多试几次。关键标准是“最像平时说话的状态”。若恰在边界，建议男性选择低音域，女性选择高音域。</li>
</ul>`,
      audio: {
        enableMic: true,
      },
      ui: {
        showPiano: false,
        showPitchCanvas: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
      autoDetectRange: true,
    },
    {
      id: 'explore',
      title: '探索钢琴窗格',
      instruction: `
<p>左侧以钢琴键形式展示了一部分音名及其对应的音高位置。在本训练中，你只需要关注<b>白键</b>即可。</p>
<p>观察各个音名的顺序。点击左侧钢琴窗格的任意白键，听辨音高，同时观察它在屏幕上的高度位置。</p>
<p><b>完成标准：</b>能够正确在钢琴窗格中定位各个音名的位置。</p>
<p><b>备注</b></p>
<p>在真实的钢琴中，钢琴键的排列如下图所示：</p>
<img src="/images/钢琴键与CDEFGAB.png" alt="钢琴键与音名对应关系" style="width:100%;border-radius:8px;margin:8px 0;" />
<p>完成后点击“下一步”。</p>`,
      audio: {
        enableMic: false,
        playOnPianoClick: true,
      },
      ui: {
        showPiano: true,
        showPitchCanvas: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'principle',
      title: '原理：声波的三要素',
      instruction: `
<p>声音是机械波，人耳感知到的声音特性由三个物理量决定：</p>
<ul>
  <li><b>音调：</b>由声波频率决定，频率越高，音越高。画布上的蓝色音高线即频率的可视化。<b>音高</b>即为音调在音乐语境中的结构化表达。</li>
  <li><b>响度：</b>由声波振幅决定，振幅越大，声音越响。</li>
  <li><b>音色：</b>由声波的谐波结构决定。不同乐器或人声即使发出相同音高和响度的音，波形形状也不同，因此听起来不同。</li>
</ul>
<img src="/images/声音三要素.jpg" alt="声波三要素示意" style="width:100%;border-radius:8px;margin:8px 0;" />`,
      audio: { enableMic: false },
      ui: { showPiano: true, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
  ],
};

export default level1;
