// ==================== 核心物理引擎 ====================
// 物理量说明：
// h: 当前高度 (从 totalHeight 减小到 0)
// totalHeight: 下落总高度
class PhysicsEngine {
    constructor(g, totalHeight) {
        this.g = g;                    // 重力加速度 (m/s²)
        this.totalHeight = totalHeight; // 总下落高度 (m)
        this.t = 0;                    // 当前时间 (s)
        this.v = 0;                    // 当前速度 (m/s)
        this.h = totalHeight;          // 当前高度，初始为总高度
        this.impactTime = this.calculateImpactTime();
    }
    
    // 计算撞击地面的时间
    calculateImpactTime() {
        return Math.sqrt(2 * this.totalHeight / this.g);
    }
    
    // 更新物理状态
    // 返回当前高度（从 totalHeight 减小到 0）
    update(dt) {
        this.t += dt;
        const fallDistance = 0.5 * this.g * this.t * this.t; // 下落距离
        this.h = Math.max(this.totalHeight - fallDistance, 0); // 当前高度
        this.v = this.g * this.t; // 速度
        
        return {
            t: this.t,
            v: this.v,
            h: this.h,
            isComplete: this.t >= this.impactTime
        };
    }
    
    // 重置
    reset() {
        this.t = 0;
        this.v = 0;
        this.h = this.totalHeight;
    }
}

// ==================== ECharts 图表管理器 ====================
class ChartManager {
    constructor() {
        this.velocityChart = null;
        this.heightChart = null;
        this.totalHeight = 50;
        this.velocityData = [];
        this.heightData = [];
        this.timeLabels = [];
        this.initCharts();
    }

    // 设置总高度（用于y轴范围）
    setTotalHeight(h) {
        this.totalHeight = h;
        if (this.heightChart) {
            this.heightChart.setOption({
                yAxis: {
                    min: 0,
                    max: h
                }
            }, false);
        }
    }

    initCharts() {
        // 图表配置
        const velocityOption = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: '#334155',
                textStyle: { color: '#fff' },
                formatter: function(params) {
                    const data = params[0];
                    return `时间: ${data.axisValue} s<br/>速度: ${data.data.toFixed(2)} m/s`;
                }
            },
            grid: {
                left: '12%',
                right: '5%',
                top: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                name: '时间 t (s)',
                nameLocation: 'middle',
                nameGap: 25,
                nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                axisLine: { lineStyle: { color: '#475569' } },
                axisLabel: { color: '#94a3b8' },
                splitLine: { show: false },
                data: []
            },
            yAxis: {
                type: 'value',
                name: '速度 Vt (m/s)',
                nameLocation: 'middle',
                nameGap: 45,
                nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                axisLine: { lineStyle: { color: '#475569' } },
                axisLabel: { color: '#94a3b8' },
                splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
            },
            series: [{
                name: '速度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    color: '#22c55e',
                    width: 3
                },
                itemStyle: {
                    color: '#22c55e',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(34, 197, 94, 0.4)' },
                            { offset: 1, color: 'rgba(34, 197, 94, 0.05)' }
                        ]
                    }
                },
                data: []
            }]
        };

        const heightOption = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: '#334155',
                textStyle: { color: '#fff' },
                formatter: function(params) {
                    const data = params[0];
                    return `时间: ${data.axisValue} s<br/>高度: ${data.data.toFixed(2)} m`;
                }
            },
            grid: {
                left: '12%',
                right: '5%',
                top: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                name: '时间 t (s)',
                nameLocation: 'middle',
                nameGap: 25,
                nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                axisLine: { lineStyle: { color: '#475569' } },
                axisLabel: { color: '#94a3b8' },
                splitLine: { show: false },
                data: []
            },
            yAxis: {
                type: 'value',
                name: '高度 h (m)',
                nameLocation: 'middle',
                nameGap: 45,
                nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                axisLine: { lineStyle: { color: '#475569' } },
                axisLabel: { color: '#94a3b8' },
                splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
                min: 0,
                max: this.totalHeight
            },
            series: [{
                name: '高度',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    color: '#a855f7',
                    width: 3
                },
                itemStyle: {
                    color: '#a855f7',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(168, 85, 247, 0.4)' },
                            { offset: 1, color: 'rgba(168, 85, 247, 0.05)' }
                        ]
                    }
                },
                data: []
            }]
        };

        // 初始化速度-时间图
        this.velocityChart = echarts.init(document.getElementById('velocityChart'));
        this.velocityChart.setOption(velocityOption);

        // 初始化高度-时间图
        this.heightChart = echarts.init(document.getElementById('heightChart'));
        this.heightChart.setOption(heightOption);

        // 响应式
        window.addEventListener('resize', () => {
            if (this.velocityChart) this.velocityChart.resize();
            if (this.heightChart) this.heightChart.resize();
        });
    }

    // 安全更新图表
    safeSetOption(chart, option) {
        if (chart) {
            try {
                chart.setOption(option, false);
            } catch (e) {
                console.warn('Chart update failed:', e);
            }
        }
    }

    addData(t, v, h) {
        const tStr = t.toFixed(2);

        // 添加到实例变量
        this.timeLabels.push(tStr);
        this.velocityData.push(v);
        this.heightData.push(h);

        // 更新速度图 - 使用 NOT_MERGE 模式但只更新数据和轴
        this.safeSetOption(this.velocityChart, {
            xAxis: { data: this.timeLabels },
            series: [{ data: this.velocityData }]
        });

        // 更新高度图
        this.safeSetOption(this.heightChart, {
            xAxis: { data: this.timeLabels },
            yAxis: { min: 0, max: this.totalHeight },
            series: [{ data: this.heightData }]
        });
    }

    reset() {
        // 清空数据
        this.timeLabels = [];
        this.velocityData = [];
        this.heightData = [];

        // 清空图表数据（不使用 true 参数）
        this.safeSetOption(this.velocityChart, {
            xAxis: { data: [] },
            series: [{ data: [] }]
        });

        this.safeSetOption(this.heightChart, {
            xAxis: { data: [] },
            series: [{ data: [] }],
            yAxis: { min: 0, max: this.totalHeight }
        });
    }
}

// ==================== 动画渲染器 ====================
class AnimationRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.shadows = []; // 残影数组
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw(null, null, null, 0);
    }
    
    // 绘制小球
    drawBall(x, y, radius, color, alpha = 1) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // 主体
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // 高光效果
        const gradient = this.ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // 绘制残影
    drawShadow(x, y, radius, alpha) {
        // 剪影加深：提高初始透明度
        this.drawBall(x, y, radius, '#3B82F6', alpha * 0.7);
    }
    
    // 绘制地面
    drawGround(y) {
        this.ctx.fillStyle = '#854D0E';
        this.ctx.fillRect(0, y - 10, this.canvas.width, 10);
        
        // 草地纹理
        for (let i = 0; i < this.canvas.width; i += 8) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, y - 10);
            this.ctx.lineTo(i + 4, y - 20);
            this.ctx.strokeStyle = '#22C55E';
            this.ctx.stroke();
        }
    }
    
    // 绘制高度标尺
    drawHeightMarkers(totalHeight) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        const groundY = this.canvas.height - 30;
        const topY = 50;
        
        // 绘制主要刻度
        for (let h = 0; h <= totalHeight; h += 10) {
            const y = groundY - (h / totalHeight) * (groundY - topY);
            this.ctx.fillText(`${h}m`, 35, y + 4);
            this.ctx.beginPath();
            this.ctx.moveTo(30, y);
            this.ctx.lineTo(35, y);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.stroke();
        }
    }
    
    // 主绘制方法
    // currentHeight: 当前物理高度 (从 totalHeight 减小到 0)
    draw(currentHeight, radius, totalHeight) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const groundY = this.canvas.height - 30;
        const skyTopY = 50;
        
        // 绘制高度标尺
        if (totalHeight) {
            this.drawHeightMarkers(totalHeight);
        }
        
        // 绘制残影
        this.shadows.forEach(shadow => {
            // shadow.pos 是物理高度
            const shadowDisplayY = groundY - (shadow.pos / totalHeight) * (groundY - skyTopY);
            this.drawShadow(this.canvas.width / 2, shadowDisplayY, radius, shadow.alpha);
        });
        
        // 绘制地面
        this.drawGround(groundY);
        
        // 绘制小球
        if (currentHeight !== null && currentHeight !== undefined) {
            // currentHeight = totalHeight (最高点，顶部) -> skyTopY
            // currentHeight = 0 (地面，底部) -> groundY
            const displayY = groundY - (currentHeight / totalHeight) * (groundY - skyTopY);
            this.drawBall(this.canvas.width / 2, displayY, radius, '#3B82F6');
        }
    }
    
    // 添加残影
    addShadow(pos) {
        this.shadows.push({ pos, alpha: 1 });
        
        // 保持最多15个残影
        if (this.shadows.length > 15) {
            this.shadows.shift();
        }
    }
    
    // 更新残影透明度
    updateShadows() {
        this.shadows.forEach(shadow => {
            shadow.alpha -= 0.015; // 减慢消失速度
        });
        this.shadows = this.shadows.filter(s => s.alpha > 0);
    }
    
    reset() {
        this.shadows = [];
    }
}

// ==================== 实验记录管理器 ====================
class ExperimentRecorder {
    constructor() {
        this.data = [];
    }
    
    record(t, v, h, g) {
        this.data.push({ t, v, h, g });
    }
    
    export() {
        const headers = ['时间 t(s)', '速度 Vt(m/s)', '高度 h(m)', '重力加速度 g(m/s²)'];
        const rows = this.data.map(d => 
            `${d.t.toFixed(3)},${d.v.toFixed(3)},${d.h.toFixed(3)},${d.g}`
        );
        
        const csv = [headers.join(','), ...rows].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `自由落体实验_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    reset() {
        this.data = [];
    }
}

// ==================== 主应用 ====================
class FreeFallApp {
    constructor() {
        // 初始化组件
        this.physics = null;
        this.renderer = new AnimationRenderer('animationCanvas');
        this.chartManager = new ChartManager();
        this.recorder = new ExperimentRecorder();
        
        // 状态
        this.isRunning = false;
        this.lastTime = 0;
        this.timeScale = 1;
        this.totalHeight = 50;
        this.currentG = 9.8;
        this.ballRadius = 20;
        this.lastShadowTime = 0;
        this.animationId = null;
        
        // 绑定UI元素
        this.bindElements();
        this.bindEvents();
        this.updateEstimatedTime();
        this.updateHeightMarkers();
        
        // 初始化显示 - 小球在顶部
        this.renderer.draw(this.totalHeight, this.ballRadius, this.totalHeight);
    }
    
    // 仅重置动画状态（高度滑块改变时调用）
    resetAnimation() {
        this.pause();
        this.physics = null;
        this.renderer.reset();
        this.chartManager.reset();
        this.recorder.reset();
        this.collisionAlert.classList.add('hidden');
        
        // 重置显示 - 小球回到顶部
        this.updateDisplay(0, 0, this.totalHeight);
        this.renderer.draw(this.totalHeight, this.ballRadius, this.totalHeight);
    }
    
    bindElements() {
        this.btnStart = document.getElementById('btnStart');
        this.btnReset = document.getElementById('btnReset');
        this.btnExport = document.getElementById('btnExport');
        this.planetSelect = document.getElementById('planetSelect');
        this.heightRange = document.getElementById('heightRange');
        this.speedRange = document.getElementById('speedRange');
        this.heightValue = document.getElementById('heightValue');
        this.speedValue = document.getElementById('speedValue');
        this.estimatedTime = document.getElementById('estimatedTime');
        this.collisionAlert = document.getElementById('collisionAlert');
        this.heightTop = document.getElementById('heightTop');
        this.heightMid = document.getElementById('heightMid');
        
        this.displayTime = document.getElementById('displayTime');
        this.displayVelocity = document.getElementById('displayVelocity');
        this.displayHeight = document.getElementById('displayHeight');
        this.velocityFormula = document.getElementById('velocityFormula');
        this.heightFormula = document.getElementById('heightFormula');
    }
    
    // 更新高度标记显示
    updateHeightMarkers() {
        const totalHeight = this.totalHeight;
        this.heightTop.textContent = `${totalHeight}m`;
        this.heightMid.textContent = `${Math.round(totalHeight / 2)}m`;
    }
    
    bindEvents() {
        this.btnStart.addEventListener('click', () => this.start());
        this.btnReset.addEventListener('click', () => this.reset());
        this.btnExport.addEventListener('click', () => this.recorder.export());
        
        this.planetSelect.addEventListener('change', (e) => {
            this.currentG = parseFloat(e.target.value);
            this.updateEstimatedTime();
            // 仅重置动画状态，不改变高度
            this.resetAnimation();
        });
        
        this.heightRange.addEventListener('input', (e) => {
            this.totalHeight = parseInt(e.target.value);
            this.heightValue.textContent = this.totalHeight;
            this.updateEstimatedTime();
            this.updateHeightMarkers();
            // 更新图表的y轴范围
            this.chartManager.setTotalHeight(this.totalHeight);
            // 仅重置动画状态，不重置高度值
            this.resetAnimation();
        });
        
        this.speedRange.addEventListener('input', (e) => {
            this.timeScale = parseFloat(e.target.value);
            this.speedValue.textContent = this.timeScale.toFixed(1);
        });
    }
    
    updateEstimatedTime() {
        const time = Math.sqrt(2 * this.totalHeight / this.currentG);
        this.estimatedTime.textContent = `${time.toFixed(2)} s`;
    }
    
    start() {
        if (this.isRunning) return;
        
        // 清空图表数据，重新开始
        this.chartManager.reset();
        
        this.physics = new PhysicsEngine(this.currentG, this.totalHeight);
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastShadowTime = 0;
        this.loop();
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.physics = null;
        this.renderer.reset();
        this.chartManager.reset();
        this.recorder.reset();
        this.collisionAlert.classList.add('hidden');

        // 重置时间流速和高度到默认值
        this.timeScale = 1.0;
        this.totalHeight = 50;
        this.currentG = 9.8;
        
        // 更新UI显示
        this.speedRange.value = 1;
        this.speedValue.textContent = '1.0';
        this.heightRange.value = 50;
        this.heightValue.textContent = '50';
        this.planetSelect.value = '9.8';
        this.updateHeightMarkers();
        this.updateEstimatedTime();

        // 重置显示 - 小球回到顶部
        this.updateDisplay(0, 0, this.totalHeight);
        this.renderer.draw(this.totalHeight, this.ballRadius, this.totalHeight);
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
        this.lastTime = currentTime;
        
        // 更新时间（考虑时间缩放）
        const scaledDelta = deltaTime * this.timeScale;
        
        // 更新物理
        const state = this.physics.update(scaledDelta);
        
        // 检查是否撞击地面
        if (state.isComplete) {
            state.h = 0; // 撞击地面，高度为0
            this.collisionAlert.classList.remove('hidden');
            
            // 3秒后自动隐藏碰撞提示
            setTimeout(() => {
                this.collisionAlert.classList.add('hidden');
            }, 3000);
            
            this.pause();
        }
        
        // 添加残影（每0.5秒）
        // state.h 是当前高度（从 totalHeight 减小到 0）
        if (this.physics.t - this.lastShadowTime >= 0.5 && !state.isComplete) {
            this.renderer.addShadow(state.h);
            this.lastShadowTime = this.physics.t;
        }
        
        // 更新残影透明度
        this.renderer.updateShadows();
        
        // 更新显示
        this.updateDisplay(state.t, state.v, state.h);
        
        // 更新图表
        this.chartManager.addData(state.t, state.v, state.h);
        
        // 记录数据
        this.recorder.record(state.t, state.v, state.h, this.currentG);
        
        // 渲染动画 - 传入当前高度
        this.renderer.draw(state.h, this.ballRadius, this.totalHeight);
        
        // 继续循环
        this.animationId = requestAnimationFrame(() => this.loop());
    }
    
    updateDisplay(t, v, h) {
        this.displayTime.textContent = `${t.toFixed(2)} s`;
        this.displayVelocity.textContent = `${v.toFixed(2)} m/s`;
        this.displayHeight.textContent = `${h.toFixed(2)} m`;
        
        this.velocityFormula.textContent = `Vt = ${this.currentG} × ${t.toFixed(2)}`;
        this.heightFormula.textContent = `h = ${this.totalHeight} - 0.5 × ${this.currentG} × ${t.toFixed(2)}²`;
    }
}

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', () => {
    new FreeFallApp();
});
