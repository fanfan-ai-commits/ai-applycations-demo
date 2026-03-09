/**
 * 游戏逻辑模块 - 二进制拼图游戏
 * 规则：在各个位权位置上放置 0 或 1，组合出目标数字
 */

class BinaryPuzzleGame {
    constructor() {
        // 游戏状态
        this.slots = [0, 0, 0, 0, 0, 0]; // 6个槽位，从左向右位权递减：32, 16, 8, 4, 2, 1
        this.weights = [32, 16, 8, 4, 2, 1];
        this.targetNumber = 42;
        this.score = 0;
        this.level = 1;
        this.gameStartTime = Date.now();
        this.hintsUsed = 0;
        this.errorCount = 0;
        this.streak = 0;

        // 组件
        this.hintSystem = new HintSystem(this);

        // 初始化
        this.init();
    }

    init() {
        this.loadLevel();
        this.render();
    }

    /**
     * 加载关卡
     */
    loadLevel() {
        // 根据关卡调整目标数范围，最小值固定为10
        const levelBit = Math.floor(Math.log2(Math.max(1, this.level))) + 2;
        const maxBit = Math.max(16, Math.pow(2, levelBit)); // 至少16，确保范围够大
        const minTarget = 10; // 最小值固定为10
        
        this.targetNumber = Math.floor(Math.random() * (maxBit - minTarget + 1)) + minTarget;
        this.slots = [null, null, null, null, null, null]; // 初始为空
        this.gameStartTime = Date.now();
        this.hintsUsed = 0;
        this.errorCount = 0;
    }

    /**
     * 获取当前所有槽位的总和（1的位置乘以位权）
     */
    getCurrentSum() {
        return this.slots.reduce((sum, val, idx) => {
            if (val === null || val === undefined) return sum;
            return sum + (val * this.weights[idx]);
        }, 0);
    }

    /**
     * 获取已设置为 1 的位权列表
     */
    getActiveWeights() {
        const active = [];
        this.slots.forEach((val, idx) => {
            if (val === 1) {
                active.push(this.weights[idx]);
            }
        });
        return active;
    }

    /**
     * 获取二进制字符串表示
     */
    getBinaryString() {
        return this.slots.join('');
    }

    /**
     * 渲染游戏界面
     */
    render() {
        const currentSum = this.getCurrentSum();
        const remaining = this.targetNumber - currentSum;
        const userLevel = this.getUserLevel();

        document.getElementById('app').innerHTML = `
            <!-- 顶部信息栏 -->
            <div class="flex flex-wrap justify-between items-center gap-4 mb-6 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl shadow-cyan-500/10">
                <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    🔢 二进制拼图
                </h1>
                <div class="flex gap-4 flex-wrap">
                    <div class="bg-slate-700/80 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-600/50">
                        <span>🏆 得分</span>
                        <span class="text-cyan-400 font-bold">${this.score}</span>
                    </div>
                    <div class="bg-slate-700/80 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-600/50">
                        <span>📊</span>
                        <span class="text-purple-400 font-bold">Lv.${this.level}</span>
                    </div>
                    <div class="bg-slate-700/80 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-600/50">
                        <span>⭐</span>
                        <span class="text-pink-400">${userLevel.name}</span>
                    </div>
                </div>
            </div>

            <div class="grid lg:grid-cols-3 gap-6">
                <!-- 左侧：游戏主区域 -->
                <div class="lg:col-span-2 space-y-4">
                    <!-- 目标数值展示 -->
                    <div class="text-center">
                        <div class="inline-block bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl px-8 py-6 relative shadow-xl shadow-cyan-500/20">
                            <p class="text-cyan-400/80 text-sm mb-1">🎯 目标数值</p>
                            <p class="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">${this.targetNumber}</p>
                        </div>
                    </div>

                    <!-- 进度条 -->
                    <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl">
                        <div class="flex justify-between text-sm mb-2">
                            <span>当前: <strong class="text-cyan-400">${currentSum}</strong></span>
                            <span class="text-slate-400">进度</span>
                            <span>目标: <strong class="text-purple-400">${this.targetNumber}</strong></span>
                        </div>
                        <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full transition-all duration-500 ${currentSum === this.targetNumber ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50' : currentSum > this.targetNumber ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50' : 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/50'}" style="width: ${Math.min(Math.abs(currentSum / this.targetNumber) * 100, 100)}%"></div>
                        </div>
                        ${currentSum !== this.targetNumber ? `
                            <p class="text-center mt-2 text-sm ${remaining > 0 ? 'text-orange-400' : 'text-green-400'}">
                                ${remaining > 0 ? `还需要 +${remaining}` : `超过了 ${Math.abs(remaining)}`}
                            </p>
                        ` : ''}
                    </div>

                    <!-- 二进制位权槽位 -->
                    <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
                        <p class="text-center text-slate-300 mb-4 text-sm">💡 在每个位权位置拖拽放置 0 或 1，使总和等于目标数值</p>
                        
                        <!-- 0/1 拖拽源 -->
                        <div class="flex justify-center gap-8 mb-6">
                            <div class="text-center">
                                <div class="bit-option bg-slate-700/80 border-2 border-slate-600 w-14 h-18 rounded-xl flex items-center justify-center text-4xl font-bold cursor-grab hover:scale-105 transition-all shadow-lg"
                                     draggable="true" data-value="0">0</div>
                            </div>
                            <div class="text-center">
                                <div class="bit-option bg-gradient-to-r from-cyan-500 to-purple-500 w-14 h-18 rounded-xl flex items-center justify-center text-4xl font-bold cursor-grab hover:scale-105 transition-all shadow-lg shadow-cyan-500/30 border-2 border-transparent"
                                     draggable="true" data-value="1">1</div>
                            </div>
                        </div>

                        <!-- 位权槽位 -->
                        <div class="flex justify-center items-end gap-3 mb-4">
                            ${this.weights.map((w, i) => this.renderSlot(i, this.slots[i], w)).join('')}
                        </div>

                        <!-- 当前组合显示 -->
                        ${currentSum > 0 ? `
                            <div class="text-center mb-4">
                                <p class="text-slate-300 text-sm">
                                    当前: ${this.getActiveWeights().join(' + ') || '0'} = <span class="text-cyan-400 font-bold">${currentSum}</span>
                                </p>
                                <p class="text-slate-500 text-xs mt-1">
                                    二进制: <span class="font-mono text-purple-400">${this.getBinaryString()}</span>
                                </p>
                            </div>
                        ` : ''}

                        <!-- 操作按钮 -->
                        <div class="flex justify-center gap-4 mt-6">
                            <button onclick="game.resetSlots()" class="bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600 px-6 py-3 rounded-xl font-bold transition text-sm flex items-center gap-2">
                                <span>🔄</span> 重置
                            </button>
                            <button onclick="game.submitAnswer()" class="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-10 py-3 rounded-xl font-bold transition text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/30">
                                <span>✅</span> 提交答案
                            </button>
                        </div>
                    </div>

                </div>

                <!-- 右侧：AI 对话区域 -->
                <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col h-[615px] shadow-xl shadow-purple-500/10">
                    <div class="p-4 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl relative shadow-lg shadow-purple-500/30">
                                🤖
                                <span class="absolute -bottom-0 -right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></span>
                            </div>
                            <div>
                                <p class="font-bold text-white">樊樊 老师</p>
                                <p class="text-xs text-cyan-400 flex items-center gap-1">
                                    <span class="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                    在线 · AI 导师
                                </p>
                            </div>
                        </div>
                    </div>

                    <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3">
                        <div class="chat-message bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl rounded-tl-none p-3 max-w-[90%] border border-cyan-500/30">
                            <p class="text-sm text-slate-200">👋 你好！我是樊樊老师，专门教你二进制知识～</p>
                        </div>
                        <div class="chat-message bg-slate-700/50 rounded-2xl rounded-tr-none p-3 max-w-[90%] ml-auto border border-slate-600/50">
                            <p class="text-sm text-slate-200">你好！什么是二进制？</p>
                        </div>
                        <div class="chat-message bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl rounded-tl-none p-3 max-w-[90%] border border-cyan-500/30">
                            <p class="text-sm text-slate-200">😊 二进制只有 0 和 1 两个数字！每个位置代表不同的"位权"。试着在右边放 1，左边放 0，看看会发生什么？</p>
                        </div>
                    </div>

                    <div class="p-4 border-t border-slate-700/50">
                        <div class="flex gap-2">
                            <input type="text" id="chat-input" 
                                placeholder="输入问题问 AI 老师..."
                                class="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400"
                                onkeypress="if(event.key==='Enter') game.sendToAI()">
                            <button onclick="game.sendToAI()" 
                                class="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-4 py-2 rounded-xl transition">
                                ➤
                            </button>
                        </div>
                        <div class="flex justify-center gap-4 mt-2 flex-wrap">
                            <button onclick="game.sendQuickQuestion('什么是位权？')" class="text-xs text-cyan-400 hover:text-cyan-300 transition">
                                什么是位权？
                            </button>
                            <button onclick="game.sendQuickQuestion('怎么转换进制？')" class="text-xs text-purple-400 hover:text-purple-300 transition">
                                怎么转换进制？
                            </button>
                            <button onclick="game.sendQuickQuestion('二进制有什么用？')" class="text-xs text-pink-400 hover:text-pink-300 transition">
                                二进制有什么用？
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 学习统计 -->
            <div class="mt-6 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-center text-sm shadow-xl">
                <span class="text-slate-300">📚 已解答 ${this.streak} 题</span>
                <span class="mx-3 text-slate-500">|</span>
                <span class="text-slate-300">⏱️ 用时 ${this.formatTime()}</span>
                <span class="mx-3 text-slate-500">|</span>
                <span class="text-slate-300">❌ 错误 ${this.errorCount} 次</span>
            </div>
        `;

        this.scrollChatToBottom();
        this.setupDragAndDrop();
    }

    /**
     * 渲染单个槽位
     */
    renderSlot(index, value, weight) {
        const isOne = value === 1;
        const isFilled = value !== null && value !== undefined; // 判断是否已填充
        
        return `
            <div class="flex flex-col items-center gap-1">
                <div class="text-slate-400 text-sm font-bold">${weight}</div>
                <div class="slot w-14 h-20 border-2 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-200 cursor-pointer hover:scale-105
                            ${isFilled 
                                ? (isOne 
                                    ? 'bg-gradient-to-br from-cyan-500 to-purple-500 border-cyan-400 shadow-lg shadow-cyan-500/30' 
                                    : 'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 shadow-lg')
                                : 'bg-slate-800/50 border-slate-700 border-dashed'
                            }"
                     data-index="${index}" 
                     onclick="game.toggleSlot(${index})">
                    ${isFilled 
                        ? `<span class="${isOne ? 'text-white' : 'text-slate-200'}">${value}</span>` 
                        : '<span class="text-slate-600">?</span>'
                    }
                </div>
                <div class="text-slate-500 text-xs">2^${this.weights.length - 1 - index}</div>
            </div>
        `;
    }

    /**
     * 获取用户等级
     */
    getUserLevel() {
        const levels = [
            { min: 0, name: '🔰 新手入门' },
            { min: 200, name: '📚 初学乍练' },
            { min: 500, name: '💪 小有所成' },
            { min: 1000, name: '🎯 熟能生巧' },
            { min: 2000, name: '🌟 融会贯通' },
            { min: 5000, name: '🏆 二进制大师' }
        ];

        for (let i = levels.length - 1; i >= 0; i--) {
            if (this.score >= levels[i].min) {
                return levels[i];
            }
        }
        return levels[0];
    }

    /**
     * 格式化时间
     */
    formatTime() {
        const seconds = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${remainingSeconds}秒`;
    }

    /**
     * 设置拖拽事件
     */
    setupDragAndDrop() {
        const bitOptions = document.querySelectorAll('.bit-option');
        
        bitOptions.forEach(option => {
            option.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.value);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', (e) => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                
                const value = parseInt(e.dataTransfer.getData('text/plain'));
                const index = parseInt(slot.dataset.index);
                
                this.slots[index] = value;
                this.render();
            });
        });
    }

    /**
     * 切换槽位值（点击切换 0/1）
     */
    toggleSlot(index) {
        if (this.slots[index] === null) {
            this.slots[index] = 1; // 初始点击设为 1
        } else {
            this.slots[index] = this.slots[index] === 0 ? 1 : 0; // 已有值则切换
        }
        this.render();
    }

    /**
     * 重置所有槽位为空
     */
    resetSlots() {
        this.slots = [null, null, null, null, null, null];
        this.render();
    }

    /**
     * 提交答案
     */
    submitAnswer() {
        const currentSum = this.getCurrentSum();
        const timeSpent = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        if (currentSum === this.targetNumber) {
            // 答对了！
            const timeBonus = Math.max(0, API_CONFIG.game.timeBonusLimit - timeSpent);
            const hintPenalty = this.hintsUsed * 10;
            const points = API_CONFIG.scoring.correctAnswer + timeBonus - hintPenalty;
            
            this.score += Math.max(10, points);
            this.streak++;
            
            this.showNotification(`🎉 正确！+${Math.max(10, points)} 分！`, 'success');
            
            const binary = this.getBinaryString();
            this.addChatMessage('assistant', `太棒了！🎉\n\n${this.targetNumber} 的二进制是 ${binary}\n\n${binary.split('').map((b, i) => {
                if (b === '1') {
                    const weight = this.weights[i];
                    return `${weight}`;
                }
                return '';
            }).filter(Boolean).join(' + ')} = ${this.targetNumber}\n\n${this.hintsUsed === 0 ? '没用任何提示就答对了，非常厉害！✨' : `用了 ${this.hintsUsed} 次提示，继续加油！💪`}`);
            
            this.celebrateSuccess();
            
            setTimeout(() => {
                this.level++;
                this.loadLevel();
                this.render();
            }, 2500);
        } else {
            // 答错了
            this.errorCount++;
            this.streak = 0;
            this.showNotification(`❌ 还不对哦，当前是 ${currentSum}，目标是 ${this.targetNumber}`, 'error');
            this.addChatMessage('assistant', `别着急～\n\n当前总和是 ${currentSum}\n目标是 ${this.targetNumber}\n\n提示：${this.targetNumber} 的二进制是 ${this.targetNumber.toString(2).padStart(this.weights.length, '0')}`);
        }
    }

    /**
     * 跳过当前关卡
     */
    skipLevel() {
        if (this.score >= 50) {
            this.score += API_CONFIG.scoring.skipLevel;
            this.level++;
            this.loadLevel();
            this.render();
            this.addChatMessage('assistant', '好的，我们换一道题！加油！💪');
        } else {
            this.showNotification('积分不足，无法跳过！', 'error');
        }
    }

    /**
     * 请求小提示
     */
    requestSmallHint() {
        if (this.score < Math.abs(API_CONFIG.scoring.smallHint)) {
            this.showNotification('积分不足！', 'error');
            return;
        }
        
        this.score += API_CONFIG.scoring.smallHint;
        this.hintsUsed++;
        
        const hint = this.hintSystem.analyzeAndGiveHint();
        this.addChatMessage('assistant', hint.message);
        this.showNotification(`${API_CONFIG.scoring.smallHint} 分`, 'info');
    }

    /**
     * 请求详细讲解
     */
    requestDetailedHint() {
        if (this.score < Math.abs(API_CONFIG.scoring.detailedHint)) {
            this.showNotification('积分不足！', 'error');
            return;
        }
        
        this.score += API_CONFIG.scoring.detailedHint;
        this.hintsUsed++;
        
        this.askAIExplanation();
        this.showNotification(`${API_CONFIG.scoring.detailedHint} 分`, 'info');
    }

    /**
     * 请求概念讲解
     */
    requestConceptExplanation() {
        if (this.score < Math.abs(API_CONFIG.scoring.conceptExplanation)) {
            this.showNotification('积分不足！', 'error');
            return;
        }
        
        this.score += API_CONFIG.scoring.conceptExplanation;
        
        this.askAIConcept();
        this.showNotification(`${API_CONFIG.scoring.conceptExplanation} 分`, 'info');
    }

    /**
     * 向 AI 发送问题
     */
    async sendToAI() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage('user', message);
        input.value = '';
        
        this.showTypingIndicator();
        
        const response = await window.aiChat.sendMessage(message, {
            currentLevel: this.level,
            targetNumber: this.targetNumber,
            currentSum: this.getCurrentSum(),
            activeWeights: this.getActiveWeights(),
            errorCount: this.errorCount
        });
        
        this.hideTypingIndicator();
        this.addChatMessage('assistant', response);
    }

    /**
     * 发送快捷问题
     */
    sendQuickQuestion(question) {
        document.getElementById('chat-input').value = question;
        this.sendToAI();
    }

    /**
     * 请求 AI 详细讲解
     */
    async askAIExplanation() {
        const question = `帮我详细解释这道题：\n目标数值是 ${this.targetNumber}\n当前总和是 ${this.getCurrentSum()}\n请给出详细的解题思路和步骤。`;
        
        this.showTypingIndicator();
        const response = await window.aiChat.sendMessage(question);
        this.hideTypingIndicator();
        this.addChatMessage('assistant', response);
    }

    /**
     * 请求 AI 概念讲解
     */
    async askAIConcept() {
        const question = '请详细讲解二进制位权的概念，用生活化的例子说明。';
        
        this.showTypingIndicator();
        const response = await window.aiChat.sendMessage(question);
        this.hideTypingIndicator();
        this.addChatMessage('assistant', response);
    }

    /**
     * 添加聊天消息
     */
    addChatMessage(role, content) {
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role === 'user' 
            ? 'bg-slate-700/50 rounded-2xl rounded-tr-none p-3 max-w-[90%] ml-auto border border-slate-600/50' 
            : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl rounded-tl-none p-3 max-w-[90%] border border-cyan-500/30'
        }`;
        messageDiv.innerHTML = `<p class="text-sm text-slate-200 whitespace-pre-line">${content}</p>`;
        
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    /**
     * 显示 typing 指示器
     */
    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'chat-message bg-slate-700/50 rounded-2xl rounded-tl-none p-3 max-w-[90%] border border-slate-600/50';
        typingDiv.innerHTML = `<p class="text-sm text-slate-400 typing-indicator"><span>AI 正在思考</span><span>.</span><span>.</span><span>.</span></p>`;
        chatMessages.appendChild(typingDiv);
        this.scrollChatToBottom();
    }

    /**
     * 隐藏 typing 指示器
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    /**
     * 滚动聊天到底部
     */
    scrollChatToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-gradient-to-r from-green-500 to-emerald-500',
            error: 'bg-gradient-to-r from-red-500 to-pink-500',
            info: 'bg-gradient-to-r from-cyan-500 to-purple-500'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -20px)';
            notification.style.transition = 'all 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * 庆祝成功动画
     */
    celebrateSuccess() {
        const app = document.getElementById('app');
        if (app) {
            app.classList.add('success-glow');
            setTimeout(() => {
                app.classList.remove('success-glow');
            }, 1500);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BinaryPuzzleGame;
}
