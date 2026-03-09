// ====== 圆锥体积公式推导器 - 主逻辑 ======

// ====== 配置 ======
const CONFIG = {
  currentMethod: 'slice',
  currentStep: 0,
  isPlaying: false,
  animationId: null,
  speed: 1,
  radius: 4,
  height: 6,
  sliceLayers: 10
};

// ====== 推导方法数据 ======
const METHODS = {
  slice: {
    name: '分割法',
    steps: [
      {
        title: '认识圆锥几何',
        content: `
          <p>圆锥是由一个<span class="step-highlight">圆形底面</span>和一个<span class="step-highlight">顶点</span>组成的几何体。</p>
          <p>我们用 <b>r</b> 表示底面半径，<b>h</b> 表示圆锥的高度。</p>
          <div class="step-tip">💡 思考：圆锥的体积会和底面积、高度有怎样的关系？</div>
        `,
        tip: '点击"下一步"继续推导'
      },
      {
        title: '水平分割圆锥',
        content: `
          <p>将圆锥沿<span class="step-highlight">水平方向</span>分割成 n 个薄片。</p>
          <p>每个薄片可以近似看作一个<span class="step-highlight">小圆柱</span>。</p>
          <p>分割的层数越多，每个薄片越接近圆柱体，结果越精确。</p>
        `,
        tip: '点击"下一步"查看薄片分析'
      },
      {
        title: '分析单个薄片',
        content: `
          <p>取任意一个薄片，距离顶点 <b>hᵢ</b> 处的横截面半径为 <b>rᵢ</b>。</p>
          <p>根据<span class="step-highlight">相似三角形</span>原理：</p>
          <div class="step-formula">rᵢ / hᵢ = r / h</div>
          <p>因此：<span class="step-highlight">rᵢ = (r/h) × hᵢ</span></p>
        `,
        tip: '点击"下一步"进行体积求和'
      },
      {
        title: '体积求和（积分）',
        content: `
          <p>每个薄片的体积：ΔVᵢ = π × rᵢ² × Δh</p>
          <p>代入 rᵢ = (r/h) × hᵢ：</p>
          <div class="step-formula">ΔVᵢ = π × (r/h)² × hᵢ² × Δh</div>
          <p>对所有薄片求和（当 n → ∞ 时为定积分）：</p>
        `,
        tip: '点击"下一步"查看最终公式'
      },
      {
        title: '得到公式',
        content: `
          <p>通过积分计算：</p>
          <div class="step-formula">V = ∫₀ʰ π(r/h)²x² dx</div>
          <div class="step-formula">V = π(r/h)² × [x³/3]₀ʰ</div>
          <div class="step-formula">V = (1/3) × π × r² × h</div>
          <p class="step-highlight" style="text-align:center; font-size:1.2em; margin-top:1rem;">🎉 圆锥体积公式推导完成！</p>
        `,
        tip: '你已完成分割法推导！'
      }
    ]
  },
  cylinder: {
    name: '圆柱对比法',
    steps: [
      {
        title: '准备等底等高的圆柱和圆锥',
        content: `
          <p>取一个<span class="step-highlight">圆柱</span>和一个<span class="step-highlight">圆锥</span>，要求：</p>
          <p>• <span class="step-highlight">底面积相同</span>（半径相等）</p>
          <p>• <span class="step-highlight">高度相同</span></p>
          <p>我们将通过叠放来探究它们的体积关系。</p>
        `,
        tip: '点击"下一步"开始演示'
      },
      {
        title: '圆锥放入圆柱',
        content: `
          <p>将圆锥<span class="step-highlight">放入</span>圆柱中。</p>
          <p>观察发现：圆锥只占据了圆柱 <span class="step-highlight">1/3</span> 的高度。</p>
          <div class="step-formula">1 圆锥 = 1/3 圆柱</div>
        `,
        tip: '点击"下一步"查看结论'
      },
      {
        title: '体积关系',
        content: `
          <p>结论：同底等高的圆柱，圆锥只占其 <span class="step-highlight">1/3</span> 的体积。</p>
          <div class="step-formula">V圆柱 = 3 × V圆锥</div>
        `,
        tip: '点击"下一步"查看公式'
      },
      {
        title: '得到公式',
        content: `
          <p>因为 V圆柱 = πr²h</p>
          <div class="step-formula">V圆锥 = (1/3) × π × r² × h</div>
          <p class="step-highlight" style="text-align:center; font-size:1.2em; margin-top:1rem;">🎉 圆柱对比法推导完成！</p>
        `,
        tip: '你已完成圆柱对比法推导！'
      }
    ]
  },
  experiment: {
    name: '实验法',
    steps: [
      {
        title: '实验原理',
        content: `
          <p>我们使用<span class="step-highlight">阿基米德原理</span>来验证圆锥体积：</p>
          <p>物体浸入水中后排开水的体积等于物体的体积。</p>
          <p>这就是著名的<span class="step-highlight">排水法</span>。</p>
          <div class="step-tip">💡 注意：1ml = 1cm³</div>
        `,
        tip: '点击"下一步"开始实验'
      },
      {
        title: '测量初始水位',
        content: `
          <p>首先在量筒中加入适量的水，记录<span class="step-highlight">初始水位</span>。</p>
          <p>假设初始水位为 <b>200 ml</b>（200 cm³）</p>
          <p>这个水位将作为我们的参考基准。</p>
        `,
        tip: '点击"下一步"放入圆锥'
      },
      {
        title: '放入圆锥体',
        content: `
          <p>将圆锥<span class="step-highlight">完全浸没</span>在水中。</p>
          <p>观察水位上升，上升的体积等于圆锥的体积。</p>
          <p>假设放入后水位上升到 <b>280 ml</b>（280 cm³）</p>
        `,
        tip: '点击"下一步"计算结果'
      },
      {
        title: '计算体积',
        content: `
          <p><span class="step-highlight">排水体积</span> = 最终水位 - 初始水位</p>
          <div class="step-formula">V = 280 - 200 = 80 cm³</div>
          <p>使用公式验证（r=3cm, h≈8.5cm）：</p>
          <div class="step-formula">V = (1/3)πr²h ≈ 80 cm³</div>
          <p>实验值与理论值相近，<span class="step-highlight">验证成功</span>！</p>
        `,
        tip: '点击"下一步"了解误差来源'
      },
      {
        title: '误差分析',
        content: `
          <p>实验存在一定<span class="step-highlight">误差</span>，可能原因：</p>
          <p>• 圆锥未完全浸没</p>
          <p>• 读数时的视觉误差</p>
          <p>• 水量溅出</p>
          <div class="step-tip">💡 思考：如何设计更精确的实验？</div>
          <p class="step-highlight" style="text-align:center; font-size:1.2em; margin-top:1rem;">🎉 实验法验证完成！</p>
        `,
        tip: '你已完成实验法学习！'
      }
    ]
  }
};

// ====== DOM 元素 ======
const elements = {
  canvas: null,
  ctx: null,
  stepsContainer: null,
  playBtn: null,
  pauseBtn: null,
  replayBtn: null,
  speedSelect: null,
  prevStepBtn: null,
  nextStepBtn: null,
  resetBtn: null
};

// ====== 初始化 ======
function init() {
  // 获取DOM元素
  elements.canvas = document.getElementById('mainCanvas');
  elements.ctx = elements.canvas.getContext('2d');
  elements.stepsContainer = document.getElementById('stepsContainer');
  elements.playBtn = document.getElementById('playBtn');
  elements.pauseBtn = document.getElementById('pauseBtn');
  elements.replayBtn = document.getElementById('replayBtn');
  elements.speedSelect = document.getElementById('speedSelect');
  elements.prevStepBtn = document.getElementById('prevStepBtn');
  elements.nextStepBtn = document.getElementById('nextStepBtn');
  elements.resetBtn = document.getElementById('resetBtn');

  // 设置画布大小
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 绑定事件
  bindEvents();

  // 初始化方法选择
  selectMethod('slice');

  // 初始绘制
  draw();
  
  // 启动动画循环（用于倒水动画）
  requestAnimationFrame(animationLoop);
}

// ====== 动画循环 ======
let lastTime = 0;
function animationLoop(timestamp) {
  if (timestamp - lastTime > 50) {
    draw();
    lastTime = timestamp;
  }
  requestAnimationFrame(animationLoop);
}

// ====== 画布调整 ======
function resizeCanvas() {
  const container = elements.canvas.parentElement;
  elements.canvas.width = container.clientWidth;
  elements.canvas.height = container.clientHeight;
  draw();
}

// ====== 事件绑定 ======
function bindEvents() {
  // 方法选择
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectMethod(btn.dataset.method);
    });
  });

  // 播放控制
  elements.playBtn.addEventListener('click', playAnimation);
  elements.pauseBtn.addEventListener('click', pauseAnimation);
  elements.replayBtn.addEventListener('click', replayAnimation);

  // 速度选择
  elements.speedSelect.addEventListener('change', (e) => {
    CONFIG.speed = parseFloat(e.target.value);
  });

  // 步骤控制
  elements.prevStepBtn.addEventListener('click', prevStep);
  elements.nextStepBtn.addEventListener('click', nextStep);

  // 重置
  elements.resetBtn.addEventListener('click', reset);
}

// ====== 选择方法 ======
function selectMethod(method) {
  CONFIG.currentMethod = method;
  CONFIG.currentStep = 0;
  pauseAnimation();

  // 更新导航按钮
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.method === method);
  });

  // 渲染步骤
  renderSteps();
  
  // 更新按钮状态
  updateStepButtons();

  // 绘制
  draw();
}

// ====== 渲染步骤 ======
function renderSteps() {
  const method = METHODS[CONFIG.currentMethod];
  const steps = method.steps;
  
  let html = '';
  steps.forEach((step, index) => {
    const activeClass = index === CONFIG.currentStep ? 'active' : '';
    html += `
      <div class="step-item ${activeClass}" data-step="${index}">
        <div class="step-header">
          <span class="step-number">${index + 1}</span>
          <span class="step-name">${step.title}</span>
        </div>
        <div class="step-content">
          <div class="step-text">${step.content}</div>
        </div>
      </div>
    `;
  });

  elements.stepsContainer.innerHTML = html;
}

// ====== 更新步骤按钮状态 ======
function updateStepButtons() {
  const steps = METHODS[CONFIG.currentMethod].steps;
  elements.prevStepBtn.disabled = CONFIG.currentStep === 0;
  elements.nextStepBtn.disabled = CONFIG.currentStep === steps.length - 1;
}

// ====== 上一步 ======
function prevStep() {
  if (CONFIG.currentStep > 0) {
    CONFIG.currentStep--;
    updateStepUI();
  }
}

// ====== 下一步 ======
function nextStep() {
  const steps = METHODS[CONFIG.currentMethod].steps;
  if (CONFIG.currentStep < steps.length - 1) {
    CONFIG.currentStep++;
    updateStepUI();
  }
}

// ====== 更新步骤UI ======
function updateStepUI() {
  // 更新步骤显示
  document.querySelectorAll('.step-item').forEach((item, index) => {
    item.classList.toggle('active', index === CONFIG.currentStep);
  });

  // 更新按钮状态
  updateStepButtons();

  // 重新绘制
  draw();
}

// ====== 播放动画 ======
function playAnimation() {
  if (CONFIG.isPlaying) return;
  
  CONFIG.isPlaying = true;
  animate();
}

// ====== 暂停动画 ======
function pauseAnimation() {
  CONFIG.isPlaying = false;
  if (CONFIG.animationId) {
    clearTimeout(CONFIG.animationId);
    CONFIG.animationId = null;
  }
}

// ====== 重播动画 ======
function replayAnimation() {
  pauseAnimation();
  CONFIG.currentStep = 0;
  updateStepUI();
  playAnimation();
}

// ====== 动画循环 ======
function animate() {
  if (!CONFIG.isPlaying) return;

  const steps = METHODS[CONFIG.currentMethod].steps;
  
  // 延迟后进入下一步
  const delay = 3000 / CONFIG.speed;
  
  CONFIG.animationId = setTimeout(() => {
    if (CONFIG.currentStep < steps.length - 1) {
      CONFIG.currentStep++;
      updateStepUI();
      animate();
    } else {
      CONFIG.isPlaying = false;
    }
  }, delay);
}

// ====== 重置 ======
function reset() {
  pauseAnimation();
  CONFIG.currentStep = 0;
  CONFIG.radius = 4;
  CONFIG.height = 6;
  updateStepUI();
  draw();
}

// ====== 绘制函数 ======
function draw() {
  const ctx = elements.ctx;
  const width = elements.canvas.width;
  const height = elements.canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 根据当前方法和步骤绘制
  switch (CONFIG.currentMethod) {
    case 'slice':
      drawSliceMethod(ctx, cx, cy, width, height);
      break;
    case 'cylinder':
      drawCylinderMethod(ctx, cx, cy, width, height);
      break;
    case 'experiment':
      drawExperimentMethod(ctx, cx, cy, width, height);
      break;
  }
}

// ====== 绘制分割法 ======
function drawSliceMethod(ctx, cx, cy, width, height) {
  const scale = Math.min(width, height) / 20;
  const r = CONFIG.radius * scale;
  const h = CONFIG.height * scale;
  const baseY = cy + h / 2 - 20;
  const topY = baseY - h;

  // 绘制当前步骤对应的图形
  const step = CONFIG.currentStep;

  if (step === 0) {
    // 步骤0：绘制完整圆锥
    drawCone(ctx, cx, baseY, r, h, '#00d9ff');
    
    // 标注
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Noto Sans SC';
    ctx.fillText('r', cx + r + 10, baseY + 5);
    ctx.fillText('h', cx - 30, (baseY + topY) / 2);
    
    // 绘制高线
    ctx.strokeStyle = '#ff6b6b';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, baseY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制底面半径
    ctx.strokeStyle = '#00d9ff';
    ctx.beginPath();
    ctx.moveTo(cx - r, baseY);
    ctx.lineTo(cx + r, baseY);
    ctx.stroke();
    
  } else if (step === 1) {
    // 步骤1：分割圆锥
    drawSlicedCone(ctx, cx, baseY, r, h, CONFIG.sliceLayers);
    
  } else if (step === 2) {
    // 步骤2：单个薄片
    drawSingleSlice(ctx, cx, cy, r, h);
    
  } else if (step >= 3) {
    // 步骤3-4：公式推导
    drawConeWithFormula(ctx, cx, baseY, r, h);
  }
}

// ====== 绘制圆锥 ======
function drawCone(ctx, cx, baseY, r, h, color) {
  const topY = baseY - h;
  
  // 渐变填充
  const gradient = ctx.createLinearGradient(cx - r, topY, cx + r, baseY);
  gradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 217, 255, 0.1)');
  
  // 绘制圆锥主体
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 绘制轮廓
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + r, baseY);
  ctx.stroke();
  
  // 绘制底面椭圆
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// ====== 绘制分割的圆锥 ======
function drawSlicedCone(ctx, cx, baseY, r, h, layers) {
  const sliceHeight = h / layers;
  
  for (let i = 0; i < layers; i++) {
    const y1 = baseY - i * sliceHeight;
    const y2 = baseY - (i + 1) * sliceHeight;
    const ratio1 = (layers - i) / layers;
    const ratio2 = (layers - i - 1) / layers;
    const r1 = r * ratio1;
    const r2 = r * ratio2;
    
    // 颜色渐变
    const hue = 180 + (i / layers) * 20;
    const color = `hsl(${hue}, 100%, 60%)`;
    
    // 绘制薄片
    ctx.beginPath();
    ctx.moveTo(cx - r1, y1);
    ctx.lineTo(cx - r2, y2);
    ctx.lineTo(cx + r2, y2);
    ctx.lineTo(cx + r1, y1);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(cx - r1, y1, cx + r1, y1);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.2)`);
    gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.05)`);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制分隔线
    ctx.beginPath();
    ctx.ellipse(cx, y1, r1, r1 * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.5)`;
    ctx.stroke();
  }
  
  // 绘制轮廓线
  ctx.strokeStyle = '#00d9ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - h);
  ctx.lineTo(cx - r, baseY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, baseY - h);
  ctx.lineTo(cx + r, baseY);
  ctx.stroke();
}

// ====== 绘制单个薄片 ======
function drawSingleSlice(ctx, cx, cy, r, h) {
  const sliceH = h / 8;
  const sliceY = cy + sliceH / 2;
  const sliceR = r * 0.8;
  
  // 绘制圆柱体（薄片）
  const gradient = ctx.createLinearGradient(cx - sliceR, sliceY - sliceH/2, cx + sliceR, sliceY + sliceH/2);
  gradient.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
  gradient.addColorStop(0.5, 'rgba(0, 230, 118, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 217, 255, 0.4)');
  
  ctx.beginPath();
  ctx.ellipse(cx, sliceY - sliceH/2, sliceR, sliceR * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = '#00d9ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(cx, sliceY + sliceH/2, sliceR, sliceR * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(cx - sliceR, sliceY - sliceH/2);
  ctx.lineTo(cx - sliceR, sliceY + sliceH/2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + sliceR, sliceY - sliceH/2);
  ctx.lineTo(cx + sliceR, sliceY + sliceH/2);
  ctx.stroke();
  
  // 标注
  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 14px Noto Sans SC';
  ctx.fillText('rᵢ', cx + sliceR + 15, sliceY + 5);
  ctx.fillText('Δh', cx + 10, sliceY - sliceH/2 - 10);
}

// ====== 绘制带公式的圆锥 ======
function drawConeWithFormula(ctx, cx, baseY, r, h) {
  drawCone(ctx, cx, baseY, r, h, '#00d9ff');
  
  // 绘制公式框
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(cx - 100, 30, 200, 50, 10);
  ctx.fill();
  
  ctx.fillStyle = '#00e676';
  ctx.font = 'bold 20px Noto Sans SC';
  ctx.textAlign = 'center';
  ctx.fillText('V = 1/3 × π × r² × h', cx, 58);
  ctx.textAlign = 'left';
}

// ====== 动画状态 ======
let animationState = {
  coneX: 0,        // 圆锥当前位置
  lastStep: -1
};

// ====== 绘制圆柱对比法 ======
function drawCylinderMethod(ctx, cx, cy, width, height) {
  const scale = Math.min(width, height) / 25;
  const r = CONFIG.radius * scale * 0.8;
  const h = CONFIG.height * scale * 0.8;
  
  const step = CONFIG.currentStep;
  
  // 检测步骤变化，重置动画
  if (step !== animationState.lastStep) {
    animationState.lastStep = step;
    // 步骤0：圆锥在右侧；步骤1+：圆锥移动到圆柱位置
    animationState.coneX = step === 0 ? r * 3.5 : 0;
  }
  
  // 计算目标位置
  const targetConeX = step === 0 ? r * 3.5 : 0;
  
  // 平滑动画
  const animSpeed = 0.08;
  animationState.coneX += (targetConeX - animationState.coneX) * animSpeed;
  
  // 圆柱位置（居中）
  const cylX = cx;
  const cylBaseY = cy + h / 2;
  
  // 圆锥位置（根据动画）
  const coneX = cx + animationState.coneX;
  const coneBaseY = cy + h / 2;
  
  // 绘制圆柱（空心，无水）
  drawCylinder(ctx, cylX, cylBaseY, r, h, 0);
  
  // 绘制圆锥（空心）
  drawConeShell(ctx, coneX, coneBaseY, r, h, 1);
  
  // 绘制标签
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Noto Sans SC';
  ctx.textAlign = 'center';
  ctx.fillText('圆柱', cylX, cylBaseY + h/2 + 30);
  ctx.fillText('圆锥', coneX, coneBaseY + h/2 + 30);
  
  // 步骤提示文字
  ctx.font = '13px Noto Sans SC';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const stepTexts = [
    '准备：等底等高',
    '圆锥移动到圆柱位置',
    '1个圆锥 = 1/3个圆柱',
    'V圆锥 = 1/3 V圆柱',
    '公式：V = 1/3 × π × r² × h'
  ];
  ctx.fillText(stepTexts[step] || '', cx, cylBaseY + h/2 + 60);
  
  // 步骤1-3显示等式
  if (step >= 1) {
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 20px Noto Sans SC';
    ctx.fillText('1 圆锥 = 1/3 圆柱', cx, cylBaseY - h/2 - 20);
  }
  
  ctx.textAlign = 'left';
}

// ====== 绘制圆锥外壳（空心）======
function drawConeShell(ctx, cx, baseY, r, h, opacity = 1) {
  const topY = baseY - h;
  
  // 轮廓线
  ctx.strokeStyle = `rgba(0, 230, 118, ${opacity})`;
  ctx.lineWidth = 2;
  
  // 左侧边
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.stroke();
  
  // 右侧边
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + r, baseY);
  ctx.stroke();
  
  // 底面椭圆
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 顶面椭圆
  ctx.beginPath();
  ctx.ellipse(cx, topY, 0, 0, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 半透明填充
  ctx.fillStyle = `rgba(0, 230, 118, ${opacity * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
}

// ====== 绘制倒水动画 ======
function drawPouringWater(ctx, fromX, fromY, toX, toY, r) {
  // 绘制水流
  const waterColor = 'rgba(0, 217, 255, 0.9)';
  
  // 水流路径（贝塞尔曲线）- 从圆锥顶点附近流向圆柱顶部
  const cpX = (fromX + toX) / 2;
  const cpY = Math.min(fromY, toY) - 60;
  
  ctx.beginPath();
  ctx.moveTo(fromX - r * 0.5, fromY);
  ctx.quadraticCurveTo(cpX, cpY, toX, toY);
  ctx.strokeStyle = waterColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // 外层光晕
  ctx.beginPath();
  ctx.moveTo(fromX - r * 0.5, fromY);
  ctx.quadraticCurveTo(cpX, cpY, toX, toY);
  ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
  ctx.lineWidth = 10;
  ctx.stroke();
  
  // 水滴动画效果
  for (let i = 0; i < 5; i++) {
    const t = ((Date.now() / 400 + i * 0.25) % 1);
    const x = (1-t)*(1-t)*fromX + 2*(1-t)*t*cpX + t*t*toX;
    const y = (1-t)*(1-t)*fromY + 2*(1-t)*t*cpY + t*t*toY;
    const size = 4 * (1 - t);
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 230, 118, ' + (0.8 - t * 0.8) + ')';
    ctx.fill();
  }
}

// ====== 绘制圆柱 ======
function drawCylinder(ctx, cx, baseY, r, h, fillLevel = 0) {
  const topY = baseY - h;
  
  // 渐变填充 - 主体
  const gradient = ctx.createLinearGradient(cx - r, topY, cx + r, baseY);
  gradient.addColorStop(0, 'rgba(255, 107, 107, 0.25)');
  gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 107, 107, 0.25)');
  
  // 绘制圆柱主体 - 使用路径构建
  ctx.beginPath();
  ctx.moveTo(cx - r, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.lineTo(cx + r, topY);
  ctx.ellipse(cx, topY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 绘制轮廓线
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 2;
  
  // 左边线
  ctx.beginPath();
  ctx.moveTo(cx - r, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.stroke();
  
  // 右边线
  ctx.beginPath();
  ctx.moveTo(cx + r, topY);
  ctx.lineTo(cx + r, baseY);
  ctx.stroke();
  
  // 顶面椭圆
  ctx.beginPath();
  ctx.ellipse(cx, topY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 底面椭圆
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 绘制填充水位
  if (fillLevel > 0) {
    const fillHeight = h * Math.min(fillLevel, 1);
    const fillY = baseY - fillHeight;
    
    // 水的渐变
    const waterGradient = ctx.createLinearGradient(cx - r, fillY, cx + r, baseY);
    waterGradient.addColorStop(0, 'rgba(0, 217, 255, 0.7)');
    waterGradient.addColorStop(0.5, 'rgba(0, 230, 118, 0.5)');
    waterGradient.addColorStop(1, 'rgba(0, 217, 255, 0.7)');
    
    // 水面椭圆
    ctx.beginPath();
    ctx.ellipse(cx, fillY, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.9)';
    ctx.fill();
    
    // 水体填充
    ctx.beginPath();
    ctx.moveTo(cx - r, fillY);
    ctx.lineTo(cx - r, baseY);
    ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.lineTo(cx + r, fillY);
    ctx.ellipse(cx, fillY, r, r * 0.3, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = waterGradient;
    ctx.fill();
  }
}

// ====== 圆锥水位绘制（从底部向上填充）======
function drawConeWithWater(ctx, cx, baseY, r, h, fillLevel = 0) {
  const topY = baseY - h;
  
  // 绘制圆锥空壳（轮廓）
  const gradient = ctx.createLinearGradient(cx - r, topY, cx + r, baseY);
  gradient.addColorStop(0, 'rgba(0, 230, 118, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 230, 118, 0.05)');
  
  // 绘制圆锥主体
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 绘制轮廓线 - 左侧边
  ctx.strokeStyle = '#00e676';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.stroke();
  
  // 绘制轮廓线 - 右侧边
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + r, baseY);
  ctx.stroke();
  
  // 绘制底面椭圆
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 绘制水位（从底部向上填充）
  if (fillLevel > 0) {
    // 水面高度：从底部向上计算
    // fillLevel = 1 时，fillY = baseY（底部）
    // fillLevel = 0 时，fillY = topY（顶部）
    const fillY = baseY - (h * fillLevel);
    
    // 水面处的半径（根据相似三角形）
    const fillR = r * fillLevel;
    
    // 水的渐变
    const waterGradient = ctx.createLinearGradient(cx - fillR, fillY, cx + fillR, baseY);
    waterGradient.addColorStop(0, 'rgba(0, 217, 255, 0.7)');
    waterGradient.addColorStop(1, 'rgba(0, 230, 118, 0.5)');
    
    // 绘制水体（从水面到圆锥底部的区域）
    ctx.beginPath();
    ctx.moveTo(cx, fillY);  // 水面中心点
    ctx.lineTo(cx - fillR, baseY);  // 左边到底部
    // 底面椭圆弧
    ctx.ellipse(cx, baseY, fillR, fillR * 0.3, 0, Math.PI, 0);
    ctx.lineTo(cx, fillY);  // 回到水面中心
    ctx.closePath();
    ctx.fillStyle = waterGradient;
    ctx.fill();
    
    // 水面椭圆
    ctx.beginPath();
    ctx.ellipse(cx, fillY, fillR, fillR * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ====== 动画状态 ======
let experimentState = {
  coneY: -100,        // 圆锥Y位置
  waterLevel: 0,      // 水位 (0-1)
  lastStep: -1
};

// ====== 绘制实验法 ======
function drawExperimentMethod(ctx, cx, cy, width, height) {
  const scale = Math.min(width, height) / 18;
  const step = CONFIG.currentStep;
  
  // 检测步骤变化
  if (step !== experimentState.lastStep) {
    experimentState.lastStep = step;
    initExperimentState(step, scale);
  }
  
  // 更新动画
  updateExperimentAnimation(step, scale);
  
  // 量杯参数（比圆锥大）
  const beakerR = CONFIG.radius * scale * 1.8;
  const beakerH = CONFIG.height * scale * 1.5;
  const beakerX = cx;
  const beakerBaseY = cy + beakerH / 2;
  
  // 圆锥参数
  const coneR = CONFIG.radius * scale * 0.8;
  const coneH = CONFIG.height * scale * 0.8;
  const coneX = cx;
  
  // 绘制量杯（带刻度和水）
  drawBeakerWithWater(ctx, beakerX, beakerBaseY, beakerR, beakerH, experimentState.waterLevel);
  
  // 绘制圆锥（在水中）
  if (step >= 1) {
    drawConeInWater(ctx, coneX, beakerBaseY + 30, coneR, coneH);
  }
  
  // 绘制刻度
  drawBeakerScale(ctx, beakerX - beakerR - 15, beakerBaseY, beakerH);
  
  // 步骤文字
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Noto Sans SC';
  ctx.textAlign = 'center';
  const stepTexts = [
    '准备：量杯装水',
    '放入圆锥',
    '观察水位变化',
    '计算体积'
  ];
  if (step < stepTexts.length) {
    ctx.fillText(stepTexts[step], cx, cy - beakerH/2 - 30);
  }
  
  // 显示水位变化
  if (step >= 1) {
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 16px Noto Sans SC';
    const rise = Math.round(experimentState.waterLevel * 30); // 假设水位上升30ml
    ctx.fillText('水位上升: ' + rise + ' ml', cx, beakerBaseY - beakerH/2 - 50);
  }
  
  ctx.textAlign = 'left';
}

// ====== 初始化实验状态 ======
function initExperimentState(step, scale) {
  const coneH = CONFIG.height * scale * 0.8;
  
  if (step === 0) {
    // 初始状态：圆锥在上方，量杯水位低
    experimentState.coneY = -150;
    experimentState.waterLevel = 0.25; // 初始水位25%
  } else if (step === 1) {
    // 放入圆锥
    experimentState.coneY = -150;
    experimentState.waterLevel = 0.25;
  } else {
    // 圆锥已放入
    experimentState.coneY = 0;
    experimentState.waterLevel = 0.6; // 最终水位
  }
}

// ====== 更新实验动画 ======
function updateExperimentAnimation(step, scale) {
  const coneH = CONFIG.height * scale * 0.8;
  const animSpeed = 0.08;
  
  if (step === 0) {
    // 圆锥在上方等待
    const targetConeY = -150;
    experimentState.coneY += (targetConeY - experimentState.coneY) * animSpeed;
    // 水位保持低
    const targetWater = 0.25;
    experimentState.waterLevel += (targetWater - experimentState.waterLevel) * animSpeed;
  } else if (step === 1) {
    // 圆锥落入水中
    const targetConeY = -coneH * 1; // 圆锥底部在水中更深
    experimentState.coneY += (targetConeY - experimentState.coneY) * animSpeed;
    // 水位上升
    const targetWater = 0.25 + 0.35 * (experimentState.coneY / targetConeY + 1) / 2;
    experimentState.waterLevel += (Math.min(0.6, Math.max(0.25, targetWater)) - experimentState.waterLevel) * animSpeed;
  } else {
    // 圆锥完全放入
    const targetConeY = -coneH * 1;
    experimentState.coneY += (targetConeY - experimentState.coneY) * animSpeed;
    const targetWater = 0.6;
    experimentState.waterLevel += (targetWater - experimentState.waterLevel) * animSpeed;
  }
}

// ====== 绘制量杯（带水位）======
function drawBeakerWithWater(ctx, cx, baseY, r, h, waterLevel) {
  const topY = baseY - h;
  const waterH = h * waterLevel;
  const waterY = baseY - waterH;
  
  // 杯身（透明玻璃效果）
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - r, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.lineTo(cx + r, topY);
  ctx.ellipse(cx, topY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 水体填充
  if (waterLevel > 0) {
    const waterGradient = ctx.createLinearGradient(cx - r, waterY, cx + r, baseY);
    waterGradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
    waterGradient.addColorStop(0.5, 'rgba(0, 230, 118, 0.4)');
    waterGradient.addColorStop(1, 'rgba(0, 217, 255, 0.3)');
    
    ctx.beginPath();
    ctx.moveTo(cx - r + 3, waterY);
    ctx.lineTo(cx - r + 3, baseY - 3);
    ctx.ellipse(cx, baseY, r - 3, (r - 3) * 0.3, 0, 0, Math.PI * 2);
    ctx.lineTo(cx + r - 3, waterY);
    ctx.ellipse(cx, waterY, r - 3, (r - 3) * 0.3, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = waterGradient;
    ctx.fill();
    
    // 水面
    ctx.beginPath();
    ctx.ellipse(cx, waterY, r - 3, (r - 3) * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.6)';
    ctx.fill();
  }
  
  // 玻璃反光
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r + 8, topY + 20);
  ctx.lineTo(cx - r + 8, baseY - 20);
  ctx.stroke();
}

// ====== 绘制量杯刻度 ======
function drawBeakerScale(ctx, x, baseY, h) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '10px Arial';
  ctx.textAlign = 'right';
  
  const numScales = 10;
  const scaleH = h / numScales;
  
  for (let i = 0; i <= numScales; i++) {
    const y = baseY - i * scaleH;
    const isMajor = i % 2 === 0;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (isMajor ? 15 : 8), y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.stroke();
    
    if (isMajor) {
      ctx.fillText(i * 10, x - 3, y + 3);
    }
  }
}

// ====== 绘制水中的圆锥 ======
function drawConeInWater(ctx, cx, baseY, r, h) {
  const topY = baseY - h;
  
  // 半透明渐变（圆锥在水中）
  const gradient = ctx.createLinearGradient(cx - r, topY, cx + r, baseY);
  gradient.addColorStop(0, 'rgba(255, 107, 107, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 107, 107, 0.3)');
  
  // 圆锥主体
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 轮廓线
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx - r, baseY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + r, baseY);
  ctx.stroke();
  
  // 底面
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// ====== 绘制烧杯 ======
function drawBeaker(ctx, x, y, w, h, waterLevel = 0) {
  // 杯身
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 水（根据步骤）
  if (waterLevel >= 1) {
    const level = waterLevel >= 2 ? 0.3 : 0.15;
    const waterH = h * level;
    const waterY = y + h - waterH;
    
    ctx.beginPath();
    ctx.moveTo(x + 2, waterY);
    ctx.lineTo(x + 2, y + h - 2);
    ctx.lineTo(x + w - 2, y + h - 2);
    ctx.lineTo(x + w - 2, waterY);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.4)';
    ctx.fill();
    
    // 水面
    ctx.beginPath();
    ctx.ellipse(x + w/2, waterY, w/2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.6)';
    ctx.fill();
  }
}

// ====== 绘制烧杯中的圆锥 ======
function drawConeInBeaker(ctx, x, y, r, h, visible) {
  if (visible < 1) return;
  
  const topY = y - h;
  
  // 渐变填充
  const gradient = ctx.createLinearGradient(x - r, topY, x + r, y);
  gradient.addColorStop(0, 'rgba(255, 107, 107, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 107, 107, 0.2)');
  
  // 绘制圆锥主体
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x - r, y);
  // 绘制底面椭圆弧
  ctx.ellipse(x, y, r, r * 0.3, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 绘制轮廓线 - 左侧
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x - r, y);
  ctx.stroke();
  
  // 绘制轮廓线 - 右侧
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x + r, y);
  ctx.stroke();
  
  // 绘制底面椭圆
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 绘制顶点
  ctx.beginPath();
  ctx.moveTo(x - 2, topY);
  ctx.lineTo(x + 2, topY);
  ctx.stroke();
}

// ====== 绘制刻度 ======
function drawScale(ctx, x, y, h) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px Noto Sans SC';
  
  for (let i = 0; i <= 4; i++) {
    const yPos = y + h - (i * h / 4);
    const value = 100 + i * 50;
    
    ctx.beginPath();
    ctx.moveTo(x, yPos);
    ctx.lineTo(x + 8, yPos);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
    
    ctx.fillText(value + 'ml', x + 12, yPos + 4);
  }
}

// ====== 绘制数据面板 ======
function drawDataPanel(ctx, x, y, step) {
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(x, y, 150, 120, 10);
  ctx.fill();
  
  // 标题
  ctx.fillStyle = '#00d9ff';
  ctx.font = 'bold 14px Noto Sans SC';
  ctx.fillText('实验数据', x + 10, y + 25);
  
  // 数据
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '12px Noto Sans SC';
  
  let dataY = y + 50;
  ctx.fillText(`圆锥半径: ${CONFIG.radius}cm`, x + 10, dataY);
  dataY += 20;
  ctx.fillText(`圆锥高度: ${CONFIG.height}cm`, x + 10, dataY);
  dataY += 20;
  
  if (step >= 2) {
    const initial = 200;
    const final = 200 + Math.round((1/3) * Math.PI * Math.pow(CONFIG.radius, 2) * CONFIG.height * 2);
    ctx.fillText(`初始水位: ${initial}ml`, x + 10, dataY);
    dataY += 20;
    ctx.fillText(`最终水位: ${final}ml`, x + 10, dataY);
  }
  
  if (step >= 3) {
    const volume = Math.round((1/3) * Math.PI * Math.pow(CONFIG.radius, 2) * CONFIG.height);
    ctx.fillStyle = '#00e676';
    ctx.fillText(`体积: ${volume}cm³`, x + 10, dataY + 15);
  }
}

// ====== Canvas 圆角矩形兼容 ======
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// ====== 启动 ======
document.addEventListener('DOMContentLoaded', init);
