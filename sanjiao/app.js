// ===== 核心变量 =====
const canvas = document.getElementById('unitCircle');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('angleSlider');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

// 图表画布
const sinChart = document.getElementById('sinChart');
const cosChart = document.getElementById('cosChart');
const tanChart = document.getElementById('tanChart');
const sinCtx = sinChart.getContext('2d');
const cosCtx = cosChart.getContext('2d');
const tanCtx = tanChart.getContext('2d');

// 配置
const config = {
  centerX: 200,
  centerY: 200,
  radius: 150,
  scale: 150
};

// 状态
let currentAngle = 0;
let isPlaying = false;
let animationId = null;

// ===== 工具函数 =====

// 角度转弧度
function degToRad(deg) {
  return deg * Math.PI / 180;
}

// 格式化数值
function formatNumber(num, isTan = false) {
  // 处理无穷大和NaN
  if (!isFinite(num) || isNaN(num)) {
    return '不存在';
  }
  // 对于tan值，绝对值过大也视为不存在
  if (isTan && Math.abs(num) > 1000) {
    return '不存在';
  }
  return num.toFixed(2);
}

// ===== 单位圆绘制 =====
function drawUnitCircle(angleDeg) {
  const angle = degToRad(angleDeg);
  const { centerX, centerY, radius } = config;
  
  // 清空画布
  ctx.clearRect(0, 0, 400, 400);
  
  // 绘制背景网格
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 0.5;
  
  // 网格线
  for (let i = -3; i <= 3; i++) {
    // 垂直线
    ctx.beginPath();
    ctx.moveTo(centerX + i * 50, centerY - radius - 30);
    ctx.lineTo(centerX + i * 50, centerY + radius + 30);
    ctx.stroke();
    
    // 水平线
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 30, centerY + i * 50);
    ctx.lineTo(centerX + radius + 30, centerY + i * 50);
    ctx.stroke();
  }
  
  // 绘制坐标系
  ctx.strokeStyle = '#4B5563';
  ctx.lineWidth = 1.5;
  
  // X轴
  ctx.beginPath();
  ctx.moveTo(20, centerY);
  ctx.lineTo(380, centerY);
  ctx.stroke();
  
  // Y轴
  ctx.beginPath();
  ctx.moveTo(centerX, 20);
  ctx.lineTo(centerX, 380);
  ctx.stroke();
  
  // 坐标轴标签
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('x', 375, centerY - 10);
  ctx.fillText('y', centerX + 10, 25);
  
  // 绘制单位圆
  ctx.strokeStyle = '#60A5FA';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // 绘制单位圆内部填充
  ctx.fillStyle = 'rgba(96, 165, 250, 0.05)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // 计算点坐标
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY - Math.sin(angle) * radius;
  
  // 绘制角度弧线
  if (angleDeg > 0 && angleDeg < 360) {
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, -angle, angleDeg > 180);
    ctx.stroke();
    
    // 角度标注
    const labelAngle = angleDeg > 180 ? -angle / 2 : -angle / 2;
    const labelX = centerX + Math.cos(labelAngle) * 50;
    const labelY = centerY - Math.sin(labelAngle) * 50;
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`${angleDeg}°`, labelX, labelY);
  }
  
  // 绘制cos线（水平线）- 从圆心到x坐标
  ctx.strokeStyle = '#A78BFA';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x, centerY);
  ctx.stroke();
  
  // cos 标签
  if (Math.abs(Math.cos(angle)) > 0.1) {
    const cosLabelX = centerX + (Math.cos(angle) > 0 ? Math.cos(angle) * radius / 2 : Math.cos(angle) * radius / 2);
    ctx.fillStyle = '#A78BFA';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('cos', cosLabelX, centerY + (Math.cos(angle) > 0 ? -8 : 16));
  }
  
  // 绘制sin线（垂直线）- 从x坐标到动点
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, centerY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // sin 标签
  if (Math.abs(Math.sin(angle)) > 0.1) {
    const sinLabelY = centerY - (Math.sin(angle) > 0 ? Math.sin(angle) * radius / 2 : Math.sin(angle) * radius / 2);
    ctx.fillStyle = '#34D399';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('sin', x + 5, sinLabelY);
  }
  
  ctx.setLineDash([]);
  
  // 绘制半径线（从圆心到点）
  ctx.strokeStyle = '#F472B6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // 绘制正切线（扩展线）
  if (angleDeg % 90 !== 0 && Math.abs(Math.cos(angle)) > 0.01) {
    const tanEndX = centerX + Math.cos(angle) * 4;
    const tanEndY = centerY - Math.sin(angle) * 4;
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tanEndX, tanEndY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // 绘制坐标点
  // X轴点
  ctx.fillStyle = '#A78BFA';
  ctx.beginPath();
  ctx.arc(centerX + radius, centerY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('(1, 0)', centerX + radius + 5, centerY + 15);
  
  // Y轴点
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.arc(centerX, centerY - radius, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('(0, 1)', centerX + 5, centerY - radius - 5);
  
  // 绘制动点 P
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // 动点发光效果
  ctx.shadowColor = '#F472B6';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // 点坐标标签
  ctx.fillStyle = '#F9FAFB';
  ctx.font = '13px JetBrains Mono, monospace';
  const labelOffsetX = Math.cos(angle) > 0 ? 15 : -85;
  const labelOffsetY = Math.sin(angle) > 0 ? -10 : 20;
  ctx.fillText(`P(${formatNumber(Math.cos(angle))}, ${formatNumber(Math.sin(angle))})`, x + labelOffsetX, y + labelOffsetY);
  
  // 更新数值显示
  updateValues(angleDeg);
}

// ===== 绘制单位圆（不更新文字）=====
function drawUnitCircleNoUpdate(angleDeg) {
  const angle = degToRad(angleDeg);
  const { centerX, centerY, radius } = config;
  
  // 清空画布
  ctx.clearRect(0, 0, 400, 400);
  
  // 绘制背景网格
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 0.5;
  
  // 网格线
  for (let i = -3; i <= 3; i++) {
    // 垂直线
    ctx.beginPath();
    ctx.moveTo(centerX + i * 50, centerY - radius - 30);
    ctx.lineTo(centerX + i * 50, centerY + radius + 30);
    ctx.stroke();
    // 水平线
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 30, centerY + i * 50);
    ctx.lineTo(centerX + radius + 30, centerY + i * 50);
    ctx.stroke();
  }
  
  // 绘制坐标轴
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1;
  // X轴
  ctx.beginPath();
  ctx.moveTo(centerX - radius - 20, centerY);
  ctx.lineTo(centerX + radius + 20, centerY);
  ctx.stroke();
  // Y轴
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 20);
  ctx.lineTo(centerX, centerY + radius + 20);
  ctx.stroke();
  
  // 绘制单位圆
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // 绘制角度弧线
  if (angleDeg > 0) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, angle);
    ctx.stroke();
  }
  
  // 绘制半径线（到点P）
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY - Math.sin(angle) * radius;
  
  // 半径线
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // 绘制坐标线
  // sin 线（绿色）
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(x, centerY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // cos 线（紫色）
  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // 绘制点P
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // 绘制坐标点
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(x, centerY, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#a78bfa';
  ctx.beginPath();
  ctx.arc(centerX, y, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // 绘制标签
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText('x', centerX + radius + 25, centerY + 4);
  ctx.fillText('y', centerX + 4, centerY - radius - 25);
  ctx.fillText('0', centerX - 15, centerY + 15);
  ctx.fillText('P', x + 8, y - 8);
  
  // 绘制角度标签
  if (angleDeg > 0 && angleDeg < 360) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '13px JetBrains Mono, monospace';
    const labelOffsetX = Math.cos(angle) > 0 ? 15 : -85;
    const labelOffsetY = Math.sin(angle) > 0 ? -10 : 20;
    ctx.fillText(`P(${formatNumber(Math.cos(angle))}, ${formatNumber(Math.sin(angle))})`, x + labelOffsetX, y + labelOffsetY);
  }
}

// ===== 更新数值显示 =====
function updateValues(angleDeg) {
  const angle = degToRad(angleDeg);
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const tan = Math.tan(angle);
  
  // 更新角度显示
  document.getElementById('angleDisplay').textContent = `${angleDeg}°`;
  document.getElementById('radianDisplay').textContent = angle.toFixed(2);
  
  // 更新函数值显示
  document.getElementById('sinValue').textContent = formatNumber(sin);
  document.getElementById('cosValue').textContent = formatNumber(cos);
  document.getElementById('tanValue').textContent = formatNumber(tan, true);
  
  // 更新公式显示
  document.getElementById('sinFormula').textContent = `y/r = ${formatNumber(sin)}`;
  document.getElementById('cosFormula').textContent = `x/r = ${formatNumber(cos)}`;
  document.getElementById('tanFormula').textContent = `y/x = ${formatNumber(tan, true)}`;
  
  // 更新图表
  drawCharts(angleDeg);
}

// ===== 绘制三角函数图表 =====
function drawCharts(angleDeg) {
  drawFunctionChart(sinCtx, sinChart, (x) => Math.sin(x), angleDeg, '#34D399');
  drawFunctionChart(cosCtx, cosChart, (x) => Math.cos(x), angleDeg, '#A78BFA');
  drawFunctionChart(tanCtx, tanChart, (x) => Math.tan(x), angleDeg, '#FBBF24', true);
}

function drawFunctionChart(chartCtx, chartCanvas, func, currentDeg, color, isTan = false) {
  const width = chartCanvas.width = chartCanvas.offsetWidth * 2;
  const height = chartCanvas.height = chartCanvas.offsetHeight * 2;
  
  // 清空画布
  chartCtx.clearRect(0, 0, width, height);
  
  // 背景
  chartCtx.fillStyle = 'rgba(31, 41, 55, 0.3)';
  chartCtx.fillRect(0, 0, width, height);
  
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const centerY = height / 2;
  
  // 绘制零线
  chartCtx.strokeStyle = '#4B5563';
  chartCtx.lineWidth = 1;
  chartCtx.beginPath();
  chartCtx.moveTo(padding, centerY);
  chartCtx.lineTo(width - padding, centerY);
  chartCtx.stroke();
  
  // 绘制x轴刻度 (0 到 360度)
  chartCtx.fillStyle = '#6B7280';
  chartCtx.font = '10px Inter, sans-serif';
  for (let deg = 0; deg <= 360; deg += 90) {
    const x = padding + (deg / 360) * chartWidth;
    chartCtx.fillText(`${deg}°`, x - 10, height - 8);
  }
  
  // 绘制函数曲线
  chartCtx.strokeStyle = color;
  chartCtx.lineWidth = 2.5;
  chartCtx.beginPath();
  
  let startDrawing = true;
  for (let px = 0; px <= chartWidth; px++) {
    const deg = (px / chartWidth) * 360;
    const rad = degToRad(deg);
    let value = func(rad);
    
    // 处理tan的无穷大
    if (isTan && Math.abs(value) > 3) {
      startDrawing = true;
      continue;
    }
    
    // 缩放
    const scale = isTan ? chartHeight / 6 : chartHeight / 2;
    const py = centerY - value * scale * (isTan ? 0.8 : 1);
    
    if (startDrawing) {
      chartCtx.moveTo(padding + px, py);
      startDrawing = false;
    } else {
      chartCtx.lineTo(padding + px, py);
    }
  }
  chartCtx.stroke();
  
  // 绘制当前角度的指示线
  const currentX = padding + (currentDeg / 360) * chartWidth;
  const currentRad = degToRad(currentDeg);
  let currentValue = func(currentRad);
  
  // 对于tan值，如果绝对值过大则视为不存在
  if (isTan && Math.abs(currentValue) > 100) {
    // 显示"不存在"文本
    chartCtx.fillStyle = color;
    chartCtx.font = 'bold 12px Inter, sans-serif';
    chartCtx.textAlign = 'center';
    chartCtx.fillText('不存在', currentX, centerY);
    chartCtx.textAlign = 'left';
    return;
  }
  
  if (isTan && Math.abs(currentValue) > 3) {
    // 不绘制tan的无穷大指示器
  } else {
    const scale = isTan ? chartHeight / 6 : chartHeight / 2;
    const currentY = centerY - currentValue * scale * (isTan ? 0.8 : 1);
    
    // 垂直指示线
    chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    chartCtx.lineWidth = 1;
    chartCtx.setLineDash([4, 4]);
    chartCtx.beginPath();
    chartCtx.moveTo(currentX, padding);
    chartCtx.lineTo(currentX, height - padding);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    
    // 当前点
    chartCtx.fillStyle = color;
    chartCtx.beginPath();
    chartCtx.arc(currentX, currentY, 10, 0, Math.PI * 2);
    chartCtx.fill();
    
    // 发光效果
    chartCtx.shadowColor = color;
    chartCtx.shadowBlur = 10;
    chartCtx.beginPath();
    chartCtx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    chartCtx.fill();
    chartCtx.shadowBlur = 0;
  }
}

// ===== 动画播放 =====
function togglePlay() {
  isPlaying = !isPlaying;
  const playIcon = document.getElementById('playIcon');
  
  if (isPlaying) {
    playIcon.textContent = '⏸';
    playBtn.innerHTML = '<span id="playIcon">⏸</span> 暂停';
    animate();
  } else {
    playIcon.textContent = '▶';
    playBtn.innerHTML = '<span id="playIcon">▶</span> 播放';
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }
}

let lastUpdateTime = 0;
const textUpdateInterval = 50; // 文字更新间隔(毫秒)

function animate(timestamp) {
  if (!isPlaying) return;
  
  currentAngle = (currentAngle + 0.5) % 361;
  slider.value = currentAngle;
  
  // 单位圆每帧都绘制，保持流畅（不更新文字）
  drawUnitCircleNoUpdate(currentAngle);
  
  // 限制文字更新频率，避免闪烁
  if (timestamp - lastUpdateTime > textUpdateInterval) {
    updateValues(currentAngle);
    lastUpdateTime = timestamp;
  }
  
  animationId = requestAnimationFrame(animate);
}

// ===== 重置 =====
function reset() {
  currentAngle = 0;
  slider.value = 0;
  if (isPlaying) {
    togglePlay();
  }
  drawUnitCircle(0);
}

// ===== 画布交互 =====
function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 计算从圆心到点击位置的角
  const dx = x - config.centerX;
  const dy = config.centerY - y; // 反转Y轴
  
  let angle = Math.atan2(dy, dx) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  
  // 检查是否点击在圆附近
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > config.radius - 20 && distance < config.radius + 20) {
    currentAngle = Math.round(angle);
    slider.value = currentAngle;
    drawUnitCircle(currentAngle);
  }
}

// ===== 画布拖拽 =====
let isDragging = false;

function handleCanvasMouseDown(e) {
  isDragging = true;
  handleCanvasClick(e);
}

function handleCanvasMouseMove(e) {
  if (!isDragging) return;
  handleCanvasClick(e);
}

function handleCanvasMouseUp() {
  isDragging = false;
}

// ===== 事件监听 =====
slider.addEventListener('input', (e) => {
  currentAngle = parseInt(e.target.value);
  drawUnitCircle(currentAngle);
});

playBtn.addEventListener('click', togglePlay);
resetBtn.addEventListener('click', reset);

// 画布交互
canvas.addEventListener('mousedown', handleCanvasMouseDown);
canvas.addEventListener('mousemove', handleCanvasMouseMove);
canvas.addEventListener('mouseup', handleCanvasMouseUp);
canvas.addEventListener('mouseleave', handleCanvasMouseUp);

// ===== 窗口大小变化时重新绘制 =====
function handleResize() {
  drawUnitCircle(currentAngle);
}

window.addEventListener('resize', handleResize);

// ===== 初始化 =====
function init() {
  // 设置画布尺寸
  canvas.width = 400;
  canvas.height = 400;
  
  // 设置图表画布尺寸
  const chartContainers = document.querySelectorAll('.function-canvas');
  chartContainers.forEach(container => {
    const canvas = container;
    canvas.width = container.offsetWidth * 2;
    canvas.height = container.offsetHeight * 2;
  });
  
  // 初始绘制
  drawUnitCircle(0);
  
  // 加载保存的主题设置
  loadTheme();
}

// ===== 主题切换功能 =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function toggleTheme() {
  const isDark = document.body.classList.contains('bg-slate-900');
  
  if (isDark) {
    // 切换到亮色主题
    document.body.classList.remove('bg-slate-900', 'text-white');
    document.body.classList.add('bg-slate-100', 'text-slate-900');
    document.body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  } else {
    // 切换到暗色主题 - 深蓝紫配色
    document.body.classList.remove('bg-slate-100', 'text-slate-900');
    document.body.classList.add('bg-slate-900', 'text-white');
    document.body.classList.remove('light-theme');
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  }
  
  // 重新绘制图表以适应主题变化
  setTimeout(() => {
    drawUnitCircle(currentAngle);
  }, 100);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'light') {
    document.body.classList.remove('bg-slate-900', 'text-white');
    document.body.classList.add('bg-slate-100', 'text-slate-900');
    document.body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
  } else {
    // 默认暗色主题 - 深蓝紫配色
    document.body.classList.add('bg-slate-900', 'text-white');
    document.body.classList.remove('bg-slate-100', 'text-slate-900');
    themeIcon.textContent = '🌙';
  }
}

themeToggle.addEventListener('click', toggleTheme);

// ===== AI 面板显示/隐藏功能 =====
const aiToggle = document.getElementById('aiToggle');
const aiPanel = document.getElementById('aiPanel');
const closeAI = document.getElementById('closeAI');

function toggleAIPanel() {
  if (aiPanel.classList.contains('hidden')) {
    // 显示 AI 面板
    aiPanel.classList.remove('hidden');
    aiToggle.style.display = 'none';
  } else {
    // 隐藏 AI 面板
    aiPanel.classList.add('hidden');
    aiToggle.style.display = 'flex';
  }
}

aiToggle.addEventListener('click', toggleAIPanel);
closeAI.addEventListener('click', toggleAIPanel);

// 启动
init();

