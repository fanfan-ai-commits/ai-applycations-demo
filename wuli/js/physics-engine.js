/**
 * 物理引擎 - 电磁感应可视化
 * 处理物理模拟、动画和交互
 */

class PhysicsEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animations = [];
        this.isRunning = false;
        this.demoMode = 'induction-demo'; // 当前演示模式

        // 物理参数
        this.params = {
            coilX: 0,
            coilY: 0,
            coilWidth: 200,
            coilHeight: 100,
            magnetX: 0,
            magnetY: 0,
            magnetWidth: 40,
            magnetHeight: 80,
            magneticFieldLines: [],
            inducedCurrent: 0,
            flux: 0,
            bField: 0.5,
            fluxAngle: 0,      // 磁通量角度
            conductorX: 0,    // 导体棒位置
            conductorSpeed: 0, // 切割速度
            handRotation: 0    // 右手旋转角度
        };

        // 绑定this
        this.animate = this.animate.bind(this);
    }
    
    /**
     * 初始化画布
     */
    initCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return false;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        return true;
    }
    
    /**
     * 调整画布大小
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth || 600;
        this.canvas.height = 400;
        
        // 初始化位置
        this.params.coilX = this.canvas.width / 2 - this.params.coilWidth / 2;
        this.params.coilY = this.canvas.height / 2 - this.params.coilHeight / 2;
        this.params.magnetX = this.canvas.width / 2 - this.params.magnetWidth / 2;
        this.params.magnetY = 50;
        
        this.render();
    }
    
    /**
     * 开始动画循环
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    /**
     * 停止动画循环
     */
    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }
    
    /**
     * 动画循环
     */
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    /**
     * 更新物理状态
     */
    update() {
        // 计算穿过线圈的磁通量
        this.calculateFlux();
        
        // 计算感应电流
        this.calculateInducedCurrent();
        
        // 更新磁场线
        this.updateMagneticFieldLines();
    }
    
    /**
     * 计算磁通量
     */
    calculateFlux() {
        const { magnetY, coilY, coilHeight, bField, coilWidth } = this.params;
        
        // 简化模型：磁通量与磁铁和线圈中心的距离成反比
        const distance = Math.abs(magnetY + this.params.magnetHeight / 2 - (coilY + coilHeight / 2));
        const maxFlux = 100;
        const flux = maxFlux / (1 + distance / 150);
        
        this.params.flux = flux;
    }
    
    /**
     * 计算感应电流
     */
    calculateInducedCurrent() {
        // 电流与磁通量变化率成正比（法拉第定律）
        const { flux } = this.params;
        const prevFlux = this.params.prevFlux || flux;
        const dFlux = flux - prevFlux;
        
        // 楞次定律：感应电流总是阻碍磁通量变化
        this.params.inducedCurrent = -dFlux * 2;
        this.params.prevFlux = flux;
    }
    
    /**
     * 更新磁场线
     */
    updateMagneticFieldLines() {
        const lines = [];
        const { magnetX, magnetY, magnetWidth, magnetHeight } = this.params;
        
        // 生成从N极到S极的磁场线
        for (let i = -3; i <= 3; i++) {
            const offsetX = i * 15;
            const startX = magnetX + magnetWidth / 2 + offsetX;
            
            lines.push({
                x: startX,
                y: magnetY,
                offsetX: offsetX,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        this.params.magneticFieldLines = lines;
    }
    
    /**
     * 渲染场景
     */
    render() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const { width, height } = this.canvas;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 绘制背景
        this.drawBackground();

        // 根据演示模式绘制不同内容
        switch (this.demoMode) {
            case 'flux-demo':
                this.renderFluxDemo();
                break;
            case 'right-hand-demo':
                this.renderRightHandDemo();
                break;
            case 'faraday-demo':
                this.renderFaradayDemo();
                break;
            case 'lenz-demo':
                this.renderLenzDemo();
                break;
            case 'induction-demo':
            default:
                this.renderInductionDemo();
                break;
        }
    }

    /**
     * 渲染电磁感应演示（默认）
     */
    renderInductionDemo() {
        // 绘制磁场线
        this.drawMagneticFieldLines();

        // 绘制线圈
        this.drawCoil();

        // 绘制磁铁
        this.drawMagnet();

        // 绘制感应电流指示
        this.drawCurrentIndicator();

        // 绘制磁通量指示
        this.drawFluxIndicator();
    }

    /**
     * 渲染磁通量演示
     */
    renderFluxDemo() {
        const ctx = this.ctx;
        const { coilX, coilY, coilWidth, coilHeight } = this.params;

        // 绘制线圈（俯视图）
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.strokeRect(coilX, coilY, coilWidth, coilHeight);

        // 填充区域
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.fillRect(coilX, coilY, coilWidth, coilHeight);

        // 绘制磁场线箭头
        this.drawFluxAngle();

        // 磁通量值
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Φ = ${this.params.flux.toFixed(2)} Wb`,
            coilX + coilWidth / 2, coilY + coilHeight + 30);
    }

    /**
     * 渲染楞次定律演示
     */
    renderLenzDemo() {
        // 绘制线圈
        this.drawCoil();

        // 绘制磁场区域
        const ctx = this.ctx;
        const { coilX, coilY, coilWidth, coilHeight } = this.params;

        // 磁场强度指示
        const flux = this.params.flux;
        const gradient = ctx.createRadialGradient(
            coilX + coilWidth / 2, coilY + coilHeight / 2, 0,
            coilX + coilWidth / 2, coilY + coilHeight / 2, 150
        );
        gradient.addColorStop(0, `rgba(59, 130, 246, ${Math.abs(flux) / 100 * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制感应磁场箭头
        if (Math.abs(this.params.inducedCurrent) > 0.1) {
            const direction = this.params.inducedCurrent > 0 ? 1 : -1;
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(direction > 0 ? '↑ 感应磁场' : '↓ 感应磁场',
                coilX + coilWidth / 2, coilY - 30);
        }

        // 绘制楞次定律说明
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('楞次定律：感应电流的磁场阻碍原磁场变化', 20, this.canvas.height - 30);
    }

    /**
     * 渲染法拉第定律演示
     */
    renderFaradayDemo() {
        const ctx = this.ctx;
        const { coilX, coilY, coilWidth, coilHeight, conductorX, conductorSpeed } = this.params;

        // 绘制磁场区域（均匀磁场）
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(50, 80, this.canvas.width - 100, this.canvas.height - 160);

        // 绘制磁场线（垂直纸面）
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;
        for (let x = 80; x < this.canvas.width - 80; x += 40) {
            for (let y = 100; y < this.canvas.height - 100; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
                ctx.fill();
            }
        }

        // 绘制磁场标签
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✕ 磁场（垂直纸面向里）', this.canvas.width / 2, 70);
        ctx.fillText('✕ 磁场（垂直纸面向里）', this.canvas.width / 2, this.canvas.height - 70);

        // 绘制导体棒
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(conductorX - 5, coilY - 10, 10, coilHeight + 20);

        // 导体运动箭头
        if (Math.abs(conductorSpeed) > 0) {
            const arrowDir = conductorSpeed > 0 ? '→' : '←';
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`${arrowDir} v = ${Math.abs(conductorSpeed)} m/s`, conductorX, coilY - 30);
        }

        // 绘制电流
        if (Math.abs(this.params.inducedCurrent) > 0.1) {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('• 感应电流（流出纸面）', conductorX, coilY + coilHeight + 40);
        }

        // 公式显示
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('$$\\varepsilon = -\\frac{\\Delta\\Phi}{\\Delta t}$$', this.canvas.width - 20, 30);
    }

    /**
     * 渲染右手定则演示
     */
    renderRightHandDemo() {
        // 绘制磁场（水平方向）
        const ctx = this.ctx;

        // 磁场区域
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.fillRect(50, this.canvas.height / 2 - 60, this.canvas.width - 100, 120);

        // 绘制磁场箭头（从左到右）
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.lineWidth = 2;
        for (let x = 80; x < this.canvas.width - 80; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, this.canvas.height / 2 - 40);
            ctx.lineTo(x + 30, this.canvas.height / 2 - 40);
            this.drawArrowHead(ctx, x + 30, this.canvas.height / 2 - 40, 0);
        }
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('B →', this.canvas.width / 2, this.canvas.height / 2 + 50);

        // 绘制导体棒
        const { conductorX } = this.params;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(conductorX - 30, this.canvas.height / 2 - 8, 60, 16);

        // 绘制导体运动
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`→ v = 5 m/s`, conductorX, this.canvas.height / 2 - 50);

        // 绘制右手示意图
        this.drawRightHandRule();
    }
    
    /**
     * 绘制背景
     */
    drawBackground() {
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 绘制磁场线
     */
    drawMagneticFieldLines() {
        const ctx = this.ctx;
        const { magnetX, magnetY, magnetWidth, magnetHeight, magneticFieldLines, coilY, coilHeight } = this.params;
        
        // 绘制磁铁周围的磁场线
        magneticFieldLines.forEach((line, index) => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 + Math.sin(Date.now() / 500 + line.phase) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            // 磁场线从N极出发，经过线圈区域，到达S极
            const startX = magnetX + magnetWidth / 2 + line.offsetX;
            const coilCenterY = coilY + coilHeight / 2;
            
            // 绘制曲线
            ctx.moveTo(startX, magnetY + magnetHeight);
            
            // 贝塞尔曲线模拟磁场弯曲
            ctx.bezierCurveTo(
                startX - line.offsetX * 2, magnetY + magnetHeight + 50,
                startX + line.offsetX * 2, coilCenterY,
                startX, coilCenterY
            );
            
            ctx.stroke();
            
            // 绘制箭头
            this.drawArrowHead(ctx, startX - line.offsetX * 0.5, magnetY + magnetHeight + 25, -Math.PI / 2);
        });
        
        ctx.setLineDash([]);
    }
    
    /**
     * 绘制磁铁
     */
    drawMagnet() {
        const ctx = this.ctx;
        const { magnetX, magnetY, magnetWidth, magnetHeight } = this.params;
        
        // 绘制N极
        const nGradient = ctx.createLinearGradient(0, magnetY, 0, magnetY + magnetHeight / 2);
        nGradient.addColorStop(0, '#ef4444');
        nGradient.addColorStop(1, '#dc2626');
        
        ctx.fillStyle = nGradient;
        ctx.beginPath();
        ctx.roundRect(magnetX, magnetY, magnetWidth, magnetHeight / 2, [8, 8, 0, 0]);
        ctx.fill();
        
        // 绘制S极
        const sGradient = ctx.createLinearGradient(0, magnetY + magnetHeight / 2, 0, magnetY + magnetHeight);
        sGradient.addColorStop(0, '#3b82f6');
        sGradient.addColorStop(1, '#2563eb');
        
        ctx.fillStyle = sGradient;
        ctx.beginPath();
        ctx.roundRect(magnetX, magnetY + magnetHeight / 2, magnetWidth, magnetHeight / 2, [0, 0, 8, 8]);
        ctx.fill();
        
        // 绘制N/S标签
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('N', magnetX + magnetWidth / 2, magnetY + 25);
        ctx.fillText('S', magnetX + magnetWidth / 2, magnetY + magnetHeight - 10);
        
        // 绘制发光效果
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(magnetX + magnetWidth / 2, magnetY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fca5a5';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    /**
     * 绘制线圈
     */
    drawCoil() {
        const ctx = this.ctx;
        const { coilX, coilY, coilWidth, coilHeight } = this.params;
        
        // 绘制线圈铜线
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // 绘制螺旋线圈
        const turns = 8;
        const turnSpacing = coilWidth / turns;
        
        for (let i = 0; i < turns; i++) {
            const x = coilX + i * turnSpacing;
            
            // 上半部分
            ctx.beginPath();
            ctx.moveTo(x, coilY);
            ctx.quadraticCurveTo(x + turnSpacing / 2, coilY - 15, x + turnSpacing, coilY);
            ctx.stroke();
            
            // 下半部分
            ctx.beginPath();
            ctx.moveTo(x, coilY + coilHeight);
            ctx.quadraticCurveTo(x + turnSpacing / 2, coilY + coilHeight + 15, x + turnSpacing, coilY + coilHeight);
            ctx.stroke();
            
            // 连接部分
            if (i < turns - 1) {
                ctx.beginPath();
                ctx.moveTo(x + turnSpacing, coilY);
                ctx.lineTo(x + turnSpacing, coilY + coilHeight);
                ctx.stroke();
            }
        }
        
        // 绘制线圈边框（辅助线）
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(coilX, coilY, coilWidth, coilHeight);
        ctx.setLineDash([]);
        
        // 绘制连接点
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(coilX - 10, coilY + coilHeight / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(coilX + coilWidth + 10, coilY + coilHeight / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 绘制电流指示
     */
    drawCurrentIndicator() {
        const ctx = this.ctx;
        const { inducedCurrent, coilY, coilHeight } = this.params;
        
        if (Math.abs(inducedCurrent) < 0.1) return;
        
        const direction = inducedCurrent > 0 ? 1 : -1;
        const arrowX = this.params.coilX + this.params.coilWidth + 40;
        const arrowY = coilY + coilHeight / 2;
        
        // 绘制电流方向箭头
        ctx.fillStyle = '#10b981';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`感应电流: ${direction > 0 ? '顺时针' : '逆时针'}`, arrowX - 30, arrowY - 30);
        
        // 绘制电流方向箭头
        this.drawArrowHead(ctx, arrowX, arrowY, direction > 0 ? 0 : Math.PI);
        
        // 绘制电流大小指示
        const barWidth = Math.min(Math.abs(inducedCurrent) * 20, 50);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.fillRect(arrowX - 30, arrowY - 20, barWidth, 10);
        
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(arrowX - 30, arrowY - 20, 50, 10);
    }
    
    /**
     * 绘制磁通量指示
     */
    drawFluxIndicator() {
        const ctx = this.ctx;
        const { flux, coilX, coilY, coilHeight } = this.params;
        
        // 绘制磁通量指示器
        const indicatorX = coilX - 60;
        const indicatorY = coilY;
        const indicatorHeight = coilHeight;
        
        // 背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(indicatorX, indicatorY, 30, indicatorHeight);
        
        // 磁通量条
        const fluxHeight = (flux / 100) * indicatorHeight;
        const fluxGradient = ctx.createLinearGradient(0, indicatorY + indicatorHeight, 0, indicatorY);
        fluxGradient.addColorStop(0, '#3b82f6');
        fluxGradient.addColorStop(1, '#8b5cf6');
        
        ctx.fillStyle = fluxGradient;
        ctx.fillRect(indicatorX, indicatorY + indicatorHeight - fluxHeight, 30, fluxHeight);
        
        // 边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(indicatorX, indicatorY, 30, indicatorHeight);
        
        // 标签
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Φ', indicatorX + 15, indicatorY - 10);
    }
    
    /**
     * 绘制箭头头部
     */
    drawArrowHead(ctx, x, y, angle) {
        const size = 8;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
        ctx.closePath();
        
        ctx.fillStyle = '#10b981';
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 设置磁铁位置
     */
    setMagnetPosition(y) {
        this.params.magnetY = Math.max(20, Math.min(this.canvas.height - this.params.magnetHeight - 20, y));
    }
    
    /**
     * 移动磁铁
     */
    moveMagnet(direction) {
        const step = 5;
        switch (direction) {
            case 'up':
                this.params.magnetY -= step;
                break;
            case 'down':
                this.params.magnetY += step;
                break;
            case 'insert':
                // 自动插入动画
                this.animateMagnetInsert();
                break;
            case 'extract':
                // 自动抽出动画
                this.animateMagnetExtract();
                break;
        }
        
        // 限制范围
        this.params.magnetY = Math.max(20, Math.min(this.canvas.height - this.params.magnetHeight - 20, this.params.magnetY));
    }
    
    /**
     * 磁铁插入动画
     */
    animateMagnetInsert() {
        const targetY = this.canvas.height / 2 - this.params.magnetHeight / 2;
        const duration = 2000;
        const startY = this.params.magnetY;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out
            
            this.params.magnetY = startY + (targetY - startY) * easeProgress;
            this.render();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * 磁铁抽出动画
     */
    animateMagnetExtract() {
        const targetY = 20;
        const duration = 2000;
        const startY = this.params.magnetY;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out
            
            this.params.magnetY = startY + (targetY - startY) * easeProgress;
            this.render();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * 获取当前物理状态
     */
    getState() {
        return { ...this.params };
    }
    
    /**
     * 重置状态
     */
    reset() {
        this.params.magnetY = 50;
        this.params.inducedCurrent = 0;
        this.params.flux = 0;
        this.params.prevFlux = 0;
        this.params.fluxAngle = 0;
        this.params.conductorX = this.canvas.width / 2;
        this.params.conductorSpeed = 0;
        this.render();
    }

    /**
     * 设置演示模式
     */
    setDemoMode(demoId) {
        this.demoMode = demoId;
        this.params.magnetY = 50;
        this.params.fluxAngle = 0;
        this.params.conductorX = this.canvas.width / 2;

        // 根据模式调整画布
        if (demoId === 'flux-demo') {
            this.params.coilWidth = 150;
            this.params.coilHeight = 150;
        } else if (demoId === 'right-hand-demo') {
            this.params.magnetHeight = 40;
        }
    }

    /**
     * 磁通量演示：设置角度
     */
    setFluxAngle(angle) {
        this.params.fluxAngle = angle * Math.PI / 180;
        this.params.flux = Math.cos(this.params.fluxAngle) * 100;

        // 更新显示
        const fluxValue = document.getElementById('flux-value');
        if (fluxValue) {
            fluxValue.textContent = this.params.flux.toFixed(2);
        }
        this.render();
    }

    /**
     * 楞次定律演示
     */
    lenzDemo(action) {
        const direction = action === 'increase' ? 1 : -1;

        // 动画
        const duration = 1500;
        const startTime = Date.now();
        const startFlux = this.params.flux;
        const targetFlux = direction * 80;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.params.flux = startFlux + (targetFlux - startFlux) * easeProgress;

            // 楞次定律：感应电流阻碍变化
            this.params.inducedCurrent = -direction * Math.sin(progress * Math.PI) * 2;

            // 更新显示
            const inducedCurrentEl = document.getElementById('induced-current');
            if (inducedCurrentEl) {
                inducedCurrentEl.textContent = this.params.inducedCurrent > 0 ?
                    '顺时针 ↑' : '逆时针 ↓';
            }

            this.render();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.params.inducedCurrent = 0;
                this.render();
            }
        };
        animate();
    }

    /**
     * 法拉第定律演示
     */
    faradayDemo(speed) {
        const speedMap = { 'slow': 2, 'fast': 8 };
        const targetSpeed = speedMap[speed] || 2;

        // 自动来回移动
        let direction = 1;
        const startX = this.canvas.width / 2;
        let currentX = startX;

        const animate = () => {
            currentX += targetSpeed * direction;

            // 碰到边界反转
            if (currentX > this.canvas.width - 50 || currentX < 50) {
                direction *= -1;
            }

            this.params.conductorX = currentX;
            this.params.conductorSpeed = targetSpeed * direction;

            // 磁通量变化率 = 速度 * 磁场强度
            this.params.flux = Math.abs(targetSpeed) * 5;
            this.params.inducedCurrent = this.params.flux * 0.5;

            // 更新显示
            const emfEl = document.getElementById('emf-value');
            if (emfEl) {
                emfEl.textContent = (Math.abs(this.params.inducedCurrent) * 0.5).toFixed(2);
            }

            this.render();

            if (this.isRunning) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    /**
     * 右手定则演示
     */
    rightHandDemo(direction) {
        const dirMap = {
            'up': -90,
            'down': 90,
            'left': 180
        };

        this.params.handRotation = dirMap[direction] || 0;
        this.params.conductorSpeed = 5;
        this.params.inducedCurrent = 3;

        // 更新显示
        const thumbEl = document.getElementById('thumb-dir');
        const fingersEl = document.getElementById('fingers-dir');

        const dirNames = {
            'up': '↑ 向上',
            'down': '↓ 向下',
            'left': '← 向左'
        };

        if (thumbEl) thumbEl.textContent = dirNames[direction];
        if (fingersEl) {
            const currentDir = this.params.inducedCurrent > 0 ? '✗ 流出纸面' : '• 流入纸面';
            fingersEl.textContent = currentDir;
        }

        this.render();
    }

    /**
     * 绘制右手定则示意图
     */
    drawRightHandRule() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.params.handRotation * Math.PI / 180);

        // 磁场方向（进入纸面）
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✕ 磁场（穿入）', 0, -80);

        // 绘制手掌
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.beginPath();
        ctx.ellipse(0, 20, 50, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // 拇指（大拇指）
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(-8, -70, 16, 50);
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('拇指', 0, -45);

        // 四指
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('四指', 60, 20);

        // 电流方向
        ctx.fillStyle = '#10b981';
        ctx.font = '16px Arial';
        ctx.fillText(`电流: ${this.params.inducedCurrent > 0 ? '✗ 流出' : '• 流入'}`, 0, 100);

        ctx.restore();
    }

    /**
     * 绘制磁通量角度示意图
     */
    drawFluxAngle() {
        const ctx = this.ctx;
        const { coilX, coilY, coilWidth, coilHeight, fluxAngle } = this.params;
        const centerX = coilX + coilWidth / 2;
        const centerY = coilY + coilHeight / 2;

        // 绘制磁场方向箭头
        const arrowLength = 120;
        const endX = centerX + Math.cos(fluxAngle) * arrowLength;
        const endY = centerY - Math.sin(fluxAngle) * arrowLength;

        // 箭头
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // 箭头头部
        this.drawArrowHead(ctx, endX, endY,
            Math.atan2(-(endY - centerY), endX - centerX));

        // 绘制角度弧
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, -fluxAngle, 0, fluxAngle < 0);
        ctx.stroke();

        // 角度标签
        ctx.fillStyle = '#8b5cf6';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`θ = ${(fluxAngle * 180 / Math.PI).toFixed(0)}°`,
            centerX + 60, centerY - 10);

        // 法线方向（虚线）
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + coilHeight / 2);
        ctx.lineTo(centerX, centerY - coilHeight / 2 - 30);
        ctx.stroke();
        ctx.setLineDash([]);

        // 法线标签
        ctx.fillStyle = '#ef4444';
        ctx.font = '12px Arial';
        ctx.fillText('法线', centerX + 15, centerY - coilHeight / 2 - 10);
    }
}

// 创建全局实例
const physicsEngine = new PhysicsEngine();

