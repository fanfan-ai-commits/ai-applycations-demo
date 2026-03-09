/**
 * 函数图像工坊 - 主应用模块
 * 
 * 负责：
 * 1. 应用初始化
 * 2. 函数类型切换
 * 3. 参数调节
 * 4. 视图控制
 * 5. UI 交互
 */

// 主应用
const app = {
    // 当前函数类型
    currentType: 'quadratic',
    
    // 当前参数
    params: { a: 1, b: 0, c: 0 },
    
    /**
     * 初始化应用
     */
    init() {
        console.log('🎯 函数图像工坊初始化中...');
        
        // 初始化下拉选择框
        this.initFunctionSelect();
        
        // 渲染参数滑块
        this.renderParamsSliders();
        
        // 更新函数信息
        this.updateFunctionInfo();
        
        // 初始化 Canvas
        canvasDrawer.init();
        
        // 初始化视图
        this.resetView();
        
        // 更新视图显示
        canvasDrawer.updateZoomDisplay();
        
        console.log('✅ 初始化完成！');
    },
    
    /**
     * 初始化函数类型下拉选择框
     */
    initFunctionSelect() {
        const select = document.getElementById('functionTypeSelect');
        if (select) {
            select.value = this.currentType;
        }
    },
    
    /**
     * 渲染参数滑块
     */
    renderParamsSliders() {
        const func = FUNCTION_TYPES[this.currentType];
        const container = document.getElementById('paramsSliders');
        
        if (!func.params || func.params.length === 0) {
            container.innerHTML = '<p class="text-slate-500 text-sm">此函数无可调参数</p>';
            return;
        }
        
        container.innerHTML = func.params.map(param => {
            const value = this.params[param.key] !== undefined ? this.params[param.key] : param.default;
            let displayValue = value;
            if (param.isPi) {
                displayValue = this.formatPiValue(value);
            } else {
                displayValue = value.toFixed(2);
            }
            
            return `
                <div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="font-medium flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" style="background: ${param.color}"></span>
                            ${param.name} =
                        </span>
                        <span id="paramValue-${param.key}" class="text-blue-600 font-mono font-bold">${displayValue}</span>
                    </div>
                    <input type="range" 
                        class="slider" 
                        id="param-${param.key}"
                        min="${param.min}" 
                        max="${param.max}" 
                        step="${param.step}" 
                        value="${value}"
                        oninput="app.updateParam('${param.key}', this.value)">
                </div>
            `;
        }).join('');
    },
    
    /**
     * 格式化 π 值显示
     */
    formatPiValue(value) {
        if (Math.abs(value) < 0.01) return '0';
        if (Math.abs(value - Math.PI) < 0.01) return 'π';
        if (Math.abs(value + Math.PI) < 0.01) return '-π';
        if (Math.abs(value - Math.PI/2) < 0.01) return 'π/2';
        if (Math.abs(value + Math.PI/2) < 0.01) return '-π/2';
        return `${value.toFixed(2)}π`;
    },
    
    /**
     * 选择函数类型
     */
    selectFunction(type) {
        if (type === this.currentType) return;
        
        this.currentType = type;
        const func = FUNCTION_TYPES[type];
        
        // 重置参数
        func.params.forEach(param => {
            this.params[param.key] = param.default;
        });
        
        // 更新 UI
        this.renderParamsSliders();
        this.updateFunctionInfo();
        
        // 重置视图
        this.resetView();
        
        // 自动介绍当前函数
        aiChat.introduceFunction();
        
        // 重新绑定曲线
        canvasDrawer.draw();
    },
    
    /**
     * 更新参数
     */
    updateParam(key, value) {
        let numValue = parseFloat(value);
        
        this.params[key] = numValue;
        
        // 更新显示值
        const paramDef = FUNCTION_TYPES[this.currentType].params.find(p => p.key === key);
        let displayValue = numValue;
        if (paramDef?.isPi) {
            displayValue = this.formatPiValue(numValue);
        } else {
            displayValue = numValue.toFixed(2);
        }
        
        const valueEl = document.getElementById(`paramValue-${key}`);
        if (valueEl) {
            valueEl.textContent = displayValue;
        }
        
        // 重新绑定曲线
        canvasDrawer.draw();
    },
    
    /**
     * 更新函数信息显示
     */
    updateFunctionInfo() {
        const func = FUNCTION_TYPES[this.currentType];
        
        // 更新公式显示（如果元素存在）
        const formulaEl = document.getElementById('formulaDisplay');
        if (formulaEl && func.formulaHtml) {
            formulaEl.innerHTML = func.formulaHtml;
        }
        
        // 更新性质列表
        const propertiesEl = document.getElementById('propertiesList');
        if (propertiesEl) {
            propertiesEl.innerHTML = func.properties.map(prop => `
                <div class="p-2 bg-blue-50 rounded text-slate-700 flex items-center gap-2">
                    <span>${prop.icon}</span>
                    <span>${prop.text}</span>
                </div>
            `).join('');
        }
    },
    
    /**
     * 放大视图
     */
    zoomIn() {
        canvasDrawer.zoomIn();
    },
    
    /**
     * 缩小视图
     */
    zoomOut() {
        canvasDrawer.zoomOut();
    },
    
    /**
     * 重置视图
     */
    resetView() {
        const func = FUNCTION_TYPES[this.currentType];
        if (func?.defaultRange) {
            canvasDrawer.setRange(func.defaultRange);
        } else {
            canvasDrawer.resetView();
        }
    },
    
    /**
     * 显示通知
     */
    showNotification(message) {
        // 检查是否已存在通知
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
};

// UI 控制模块
const ui = {
    /**
     * 切换帮助弹窗
     */
    toggleHelp() {
        const modal = document.getElementById('helpModal');
        modal.classList.toggle('hidden');
        modal.classList.toggle('flex');
    },

    /**
     * 切换 AI 聊天弹窗
     */
    toggleAIChat() {
        const modal = document.getElementById('aiChatModal');
        const isHidden = modal.classList.contains('hidden');
        
        if (isHidden) {
            // 打开弹窗，初始化位置
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            initPanelPosition();
        } else {
            // 关闭弹窗
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },
    
    /**
     * 显示关于信息
     */
    showAbout() {
        alert(`🎯 函数图像工坊 v1.0

━━━━━━━━━━━━━━━━━━━━━━━━
📚 功能介绍
• 支持 5 种常见函数类型
  - 一次函数 y = ax + b
  - 二次函数 y = ax² + bx + c
  - 反比例函数 y = k/x
  - 正弦函数 y = A·sin(ωx + φ)
  - 指数函数 y = a^x

• 实时参数调节与图像绑定
• AI 导师智能答疑
• 关键点标注与渐近线
• 鼠标滚轮缩放

━━━━━━━━━━━━━━━━━━━━━━━━
🎯 技术栈
• 原生 HTML/CSS/JavaScript
• Tailwind CSS
• Canvas 2D 绑定
• 通义千问 AI

━━━━━━━━━━━━━━━━━━━━━━━━
© fanfan.ai工作室`);
    }
};

// AI 聊天弹窗拖拽功能
const aiChatModal = document.getElementById('aiChatModal');
const aiChatPanel = document.getElementById('aiChatPanel');
const aiChatHeader = document.getElementById('aiChatHeader');
let isDragging = false;
let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

// 初始化位置
function initPanelPosition() {
    xOffset = 0;
    yOffset = 0;
    aiChatPanel.style.transform = 'translate(-50%, -50%)';
}

// 鼠标按下
aiChatHeader.addEventListener('mousedown', dragStart);
// 触摸开始
aiChatHeader.addEventListener('touchstart', dragStart, {passive: false});

function dragStart(e) {
    if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target.closest('#aiChatHeader')) {
        isDragging = true;
        aiChatHeader.style.cursor = 'grabbing';
    }
}

// 鼠标移动
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, {passive: false});

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        aiChatPanel.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    }
}

// 鼠标释放
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragEnd() {
    isDragging = false;
    aiChatHeader.style.cursor = 'grab';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
