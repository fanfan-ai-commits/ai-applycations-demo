/**
 * 函数图像工坊 - Canvas 绑图模块
 * 
 * 负责：
 * 1. Canvas 初始化
 * 2. 坐标转换
 * 3. 网格、坐标轴绘制
 * 4. 函数曲线绑定
 * 5. 关键点标注
 * 6. 鼠标交互
 */

// Canvas 绑图模块
const canvasDrawer = {
    // Canvas 上下文
    ctx: null,
    canvas: null,
    
    // 画布尺寸
    width: 800,
    height: 600,
    
    // 视图范围
    range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    
    // 显示选项
    options: {
        showGrid: true,
        showKeyPoints: true,
        showAsymptote: true,
        showAnimation: false
    },
    
    // 动画相关
    animationId: null,
    progress: 0,
    
    /**
     * 初始化 Canvas
     */
    init() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布尺寸
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 添加鼠标事件
        this.addMouseListeners();
        
        // 初始绑定
        this.draw();
    },
    
    /**
     * 调整画布尺寸
     */
    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 设置实际尺寸
        this.canvas.width = rect.width;
        this.canvas.height = Math.min(600, window.innerHeight * 0.6);
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.draw();
    },
    
    /**
     * 设置视图范围
     */
    setRange(range) {
        this.range = { ...range };
        this.draw();
        this.updateZoomDisplay();
    },
    
    /**
     * 重置视图
     */
    resetView() {
        this.range = { ...VIEW_CONFIG.defaultRange };
        this.draw();
        this.updateZoomDisplay();
    },
    
    /**
     * 放大视图
     */
    zoomIn() {
        const { xMin, xMax, yMin, yMax } = this.range;
        const xMid = (xMin + xMax) / 2;
        const yMid = (yMin + yMax) / 2;
        const xSpan = xMax - xMin;
        const ySpan = yMax - yMin;
        
        this.range = {
            xMin: xMid - xSpan * VIEW_CONFIG.zoomFactor / 2,
            xMax: xMid + xSpan * VIEW_CONFIG.zoomFactor / 2,
            yMin: yMid - ySpan * VIEW_CONFIG.zoomFactor / 2,
            yMax: yMid + ySpan * VIEW_CONFIG.zoomFactor / 2
        };
        
        this.draw();
        this.updateZoomDisplay();
    },
    
    /**
     * 缩小视图
     */
    zoomOut() {
        const { xMin, xMax, yMin, yMax } = this.range;
        const xMid = (xMin + xMax) / 2;
        const yMid = (yMin + yMax) / 2;
        const xSpan = xMax - xMin;
        const ySpan = yMax - yMin;
        
        this.range = {
            xMin: xMid - xSpan / VIEW_CONFIG.zoomFactor / 2,
            xMax: xMid + xSpan / VIEW_CONFIG.zoomFactor / 2,
            yMin: yMid - ySpan / VIEW_CONFIG.zoomFactor / 2,
            yMax: yMid + ySpan / VIEW_CONFIG.zoomFactor / 2
        };
        
        this.draw();
        this.updateZoomDisplay();
    },
    
    /**
     * 更新缩放显示
     */
    updateZoomDisplay() {
        const { xMin, xMax, yMin, yMax } = this.range;
        document.getElementById('zoomLevel').textContent = 
            `x[${xMin.toFixed(0)}, ${xMax.toFixed(0)}] y[${yMin.toFixed(0)}, ${yMax.toFixed(0)}]`;
    },
    
    /**
     * 更新显示选项
     */
    updateOptions(options) {
        this.options = { ...this.options, ...options };
        this.draw();
    },
    
    /**
     * 主绘制函数
     */
    draw() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const { width, height } = this;
        const { xMin, xMax, yMin, yMax } = this.range;
        
        // 清空画布
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制网格
        if (this.options.showGrid) {
            this.drawGrid(width, height, xMin, xMax, yMin, yMax);
        }
        
        // 绘制坐标轴
        this.drawAxes(width, height, xMin, xMax, yMin, yMax);
        
        // 绘制渐近线
        if (this.options.showAsymptote) {
            this.drawAsymptotes(width, height, xMin, xMax, yMin, yMax);
        }
        
        // 绘制函数曲线
        this.drawCurve(width, height, xMin, xMax, yMin, yMax);
        
        // 绘制关键点
        if (this.options.showKeyPoints) {
            this.drawKeyPoints(width, height, xMin, xMax, yMin, yMax);
        }
    },
    
    /**
     * 绘制网格
     */
    drawGrid(w, h, xMin, xMax, yMin, yMax) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        
        // 计算刻度间隔
        const xRange = xMax - xMin;
        const yRange = yMax - yMin;
        const xStep = this.calculateStep(xRange, w);
        const yStep = this.calculateStep(yRange, h);
        
        // 垂直网格线
        const xStart = Math.ceil(xMin / xStep) * xStep;
        for (let x = xStart; x <= xMax; x += xStep) {
            const px = this.xToPixel(x);
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, h);
            ctx.stroke();
        }
        
        // 水平网格线
        const yStart = Math.ceil(yMin / yStep) * yStep;
        for (let y = yStart; y <= yMax; y += yStep) {
            const py = this.yToPixel(y);
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(w, py);
            ctx.stroke();
        }
    },
    
    /**
     * 计算合适的刻度间隔
     */
    calculateStep(range, pixels) {
        const targetTicks = pixels / 80; // 每80像素一个刻度
        const roughStep = range / targetTicks;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const normalized = roughStep / magnitude;
        
        let niceStep;
        if (normalized < 1.5) niceStep = magnitude;
        else if (normalized < 3) niceStep = 2 * magnitude;
        else if (normalized < 7) niceStep = 5 * magnitude;
        else niceStep = 10 * magnitude;
        
        return niceStep;
    },
    
    /**
     * 绘制坐标轴
     */
    drawAxes(w, h, xMin, xMax, yMin, yMax) {
        const ctx = this.ctx;
        
        // X轴
        const y0 = this.yToPixel(0);
        if (y0 >= 0 && y0 <= h) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, y0);
            ctx.lineTo(w, y0);
            ctx.stroke();
            
            // X轴箭头
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(w, y0);
            ctx.lineTo(w - 8, y0 - 4);
            ctx.lineTo(w - 8, y0 + 4);
            ctx.closePath();
            ctx.fill();
        }
        
        // Y轴
        const x0 = this.xToPixel(0);
        if (x0 >= 0 && x0 <= w) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x0, 0);
            ctx.lineTo(x0, h);
            ctx.stroke();
            
            // Y轴箭头
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(x0, 0);
            ctx.lineTo(x0 - 4, 8);
            ctx.lineTo(x0 + 4, 8);
            ctx.closePath();
            ctx.fill();
        }
        
        // 刻度标签
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        
        const xRange = xMax - xMin;
        const xStep = this.calculateStep(xRange, w);
        const xStart = Math.ceil(xMin / xStep) * xStep;
        
        for (let x = xStart; x <= xMax; x += xStep) {
            if (Math.abs(x) < 0.0001) continue; // 跳过0
            const px = this.xToPixel(x);
            if (px > 10 && px < w - 10) {
                ctx.fillText(this.formatTick(x), px, y0 + 15);
            }
        }
        
        ctx.textAlign = 'right';
        const yRange = yMax - yMin;
        const yStep = this.calculateStep(yRange, h);
        const yStart = Math.ceil(yMin / yStep) * yStep;
        
        for (let y = yStart; y <= yMax; y += yStep) {
            if (Math.abs(y) < 0.0001) continue;
            const py = this.yToPixel(y);
            if (py > 10 && py < h - 10) {
                ctx.fillText(this.formatTick(y), x0 - 5, py + 4);
            }
        }
        
        // 原点标签
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('O', x0 - 5, y0 + 15);
    },
    
    /**
     * 格式化刻度标签
     */
    formatTick(value) {
        if (Math.abs(value) < 0.001) return '0';
        if (Math.abs(value - Math.PI) < 0.01) return 'π';
        if (Math.abs(value + Math.PI) < 0.01) return '-π';
        if (Math.abs(value - Math.PI/2) < 0.01) return 'π/2';
        if (Math.abs(value + Math.PI/2) < 0.01) return '-π/2';
        if (Math.abs(value - 2*Math.PI) < 0.01) return '2π';
        return value.toFixed(1).replace(/\.?0+$/, '');
    },
    
    /**
     * 绘制渐近线
     */
    drawAsymptotes(w, h, xMin, xMax, yMin, yMax) {
        const func = FUNCTION_TYPES[app.currentType];
        if (!func || !func.asymptote) return;
        
        const ctx = this.ctx;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 4]);
        
        // 垂直渐近线 x = 0
        if (func.asymptote.includes('x=0')) {
            const px = this.xToPixel(0);
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, h);
            ctx.stroke();
        }
        
        // 水平渐近线 y = 0
        if (func.asymptote.includes('y=0')) {
            const py = this.yToPixel(0);
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(w, py);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    },
    
    /**
     * 绘制函数曲线
     */
    drawCurve(w, h, xMin, xMax, yMin, yMax) {
        const func = FUNCTION_TYPES[app.currentType];
        if (!func) return;
        
        const ctx = this.ctx;
        const params = app.params;
        
        // 曲线样式
        ctx.strokeStyle = func.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 发光效果
        ctx.shadowColor = func.color;
        ctx.shadowBlur = 15;
        
        // 绘制曲线
        ctx.beginPath();
        
        let isFirst = true;
        const step = (xMax - xMin) / (w * 2); // 每像素两步，提高精度
        
        for (let px = 0; px <= w; px += 0.5) {
            const x = xMin + px * step;
            const y = func.evaluate(x, params);
            
            if (!Number.isFinite(y) || Math.abs(y) > 10000) {
                isFirst = true;
                continue;
            }
            
            const py = this.yToPixel(y);
            
            // 检查是否在可视范围内
            if (py < -100 || py > h + 100) {
                isFirst = true;
                continue;
            }
            
            if (isFirst) {
                ctx.moveTo(px, py);
                isFirst = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
        
        // 关闭发光
        ctx.shadowBlur = 0;
    },
    
    /**
     * 绘制关键点
     */
    drawKeyPoints(w, h, xMin, xMax, yMin, yMax) {
        const func = FUNCTION_TYPES[app.currentType];
        if (!func || !func.getKeyPoints) return;
        
        const ctx = this.ctx;
        const points = func.getKeyPoints(app.params);
        
        points.forEach(pt => {
            const px = this.xToPixel(pt.x);
            const py = this.yToPixel(pt.y);
            
            // 检查是否在可视范围内
            if (px < -20 || px > w + 20 || py < -20 || py > h + 20) return;
            
            // 绘制点
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fillStyle = func.color;
            ctx.fill();
            
            // 边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 发光效果
            ctx.shadowColor = func.color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // 绘制标签
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            
            // 背景
            const metrics = ctx.measureText(pt.label);
            const bgPadding = 4;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                px - metrics.width / 2 - bgPadding,
                py - 28,
                metrics.width + bgPadding * 2,
                18
            );
            
            ctx.fillStyle = '#fff';
            ctx.fillText(pt.label, px, py - 14);
        });
    },
    
    /**
     * 坐标转换：数学坐标 -> 像素坐标
     */
    xToPixel(x) {
        return (x - this.range.xMin) / (this.range.xMax - this.range.xMin) * this.width;
    },
    
    yToPixel(y) {
        return this.height - (y - this.range.yMin) / (this.range.yMax - this.range.yMin) * this.height;
    },
    
    /**
     * 坐标转换：像素坐标 -> 数学坐标
     */
    pixelToX(px) {
        return this.range.xMin + px / this.width * (this.range.xMax - this.range.xMin);
    },
    
    pixelToY(py) {
        return this.range.yMin + (this.height - py) / this.height * (this.range.yMax - this.range.yMin);
    },
    
    /**
     * 添加鼠标事件监听
     */
    addMouseListeners() {
        if (!this.canvas) return;
        
        // 鼠标移动
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            const px = (e.clientX - rect.left) * scaleX;
            const py = (e.clientY - rect.top) * scaleY;
            
            const x = this.pixelToX(px);
            const y = this.pixelToY(py);
            
            document.getElementById('coordX').textContent = `x = ${x.toFixed(2)}`;
            document.getElementById('coordY').textContent = `y = ${y.toFixed(2)}`;
        });
        
        // 鼠标滚轮缩放
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            const px = (e.clientX - rect.left) * scaleX;
            const py = (e.clientY - rect.top) * scaleY;
            
            const x = this.pixelToX(px);
            const y = this.pixelToY(py);
            
            // 计算新的范围
            const factor = e.deltaY > 0 ? 1.1 : 0.9;
            const xSpan = (this.range.xMax - this.range.xMin) * factor;
            const ySpan = (this.range.yMax - this.range.yMin) * factor;
            
            const xMid = x + (this.range.xMax + this.range.xMin) / 2 - x;
            const yMid = y + (this.range.yMax + this.range.yMin) / 2 - y;
            
            this.range = {
                xMin: xMid - xSpan / 2,
                xMax: xMid + xSpan / 2,
                yMin: yMid - ySpan / 2,
                yMax: yMid + ySpan / 2
            };
            
            this.draw();
            this.updateZoomDisplay();
        });
        
        // 鼠标离开
        this.canvas.addEventListener('mouseleave', () => {
            document.getElementById('coordX').textContent = 'x = -';
            document.getElementById('coordY').textContent = 'y = -';
        });
    }
};

