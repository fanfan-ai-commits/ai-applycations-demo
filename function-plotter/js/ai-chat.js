/**
 * 函数图像工坊 - AI 聊天模块
 * 
 * 负责：
 * 1. AI 对话管理
 * 2. API 调用
 * 3. 聊天记录显示
 * 4. 快捷提问
 */

// AI 聊天模块
const aiChat = {
    // 对话历史
    history: [],
    
    // 状态
    isThinking: false,
    
    /**
     * 发送问题
     */
    async sendQuestion() {
        const input = document.getElementById('userQuestion');
        const question = input.value.trim();
        const container = document.getElementById('chatHistory');

        if (!question || this.isThinking) return;

        // 添加用户消息并滚动到底部
        this.addMessage('user', question);
        this.scrollToBottom();
        input.value = '';

        // 显示思考状态并滚动到底部
        this.showThinking();
        this.scrollToBottom();

        try {
            const response = await this.callAI(question);
            this.addMessage('ai', response);
        } catch (error) {
            console.error('AI API 错误:', error);
            this.addMessage('ai', '抱歉，我现在有点忙，请稍后再试。如果问题紧急，可以尝试重新提问。');
        }

        // 隐藏思考状态并滚动到底部
        this.hideThinking();
        this.scrollToBottom();
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        const container = document.getElementById('chatHistory');
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    },
    
    /**
     * 快捷提问
     */
    async quickAsk(question) {
        document.getElementById('userQuestion').value = question;
        await this.sendQuestion();
    },
    
    /**
     * 调用 AI API
     */
    async callAI(question) {
        const func = FUNCTION_TYPES[app.currentType];
        const funcRange = canvasDrawer.range;
        
        // 构建系统提示
        const systemPrompt = `${API_CONFIG.systemPrompt}

当前教学情境：
- 学生正在学习 ${func.name}
- 函数公式：${func.formula}
- 当前参数值：${JSON.stringify(app.params)}
- 当前 Canvas 显示范围：x[${funcRange.xMin.toFixed(1)}, ${funcRange.xMax.toFixed(1)}] y[${funcRange.yMin.toFixed(1)}, ${funcRange.yMax.toFixed(1)}]

请根据以上情境回答学生问题，回答要：
1. 简洁明了，适合中学生理解
2. 适当结合当前参数和图像进行讲解
3. 可以使用生活化的例子
4. 如果涉及数学推导，保持严谨
5. 控制在 150 字以内`;
        
        // 构建消息
        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.history,
            { role: 'user', content: question }
        ];
        
        // 限制历史长度
        if (messages.length > 10) {
            messages.splice(1, messages.length - 10);
        }
        
        // 调用 API
        const response = await fetch(API_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: messages,
                temperature: API_CONFIG.temperature,
                max_tokens: API_CONFIG.maxTokens
            })
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '抱歉，我暂时无法回答。';
        
        // 更新历史
        this.history.push({ role: 'user', content: question });
        this.history.push({ role: 'assistant', content: content });
        
        return content;
    },
    
    /**
     * 添加消息到聊天记录
     */
    addMessage(role, content) {
        const container = document.getElementById('chatHistory');
        const isAI = role === 'ai';
        
        const msg = document.createElement('div');
        msg.className = `chat-message ${isAI ? 'bg-white shadow-sm border border-blue-100' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'} rounded-lg p-3`;
        msg.innerHTML = `
            <div class="flex items-start gap-2">
                <span class="text-xl flex-shrink-0">${isAI ? '🤖' : '👤'}</span>
                <div class="text-sm flex-1">
                    ${isAI ? '<p class="font-bold text-blue-600 mb-1">AI 导师</p>' : '<p class="font-bold text-purple-600 mb-1">你</p>'}
                    <p class="${isAI ? 'text-slate-700' : 'text-slate-700'} whitespace-pre-wrap">${this.escapeHtml(content)}</p>
                </div>
            </div>
        `;
        
        container.appendChild(msg);
        this.scrollToBottom();
    },
    
    /**
     * 显示思考状态
     */
    showThinking() {
        this.isThinking = true;
        document.getElementById('aiStatus').classList.remove('hidden');
    },
    
    /**
     * 隐藏思考状态
     */
    hideThinking() {
        this.isThinking = false;
        document.getElementById('aiStatus').classList.add('hidden');
    },
    
    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * 清空对话历史
     */
    clearHistory() {
        this.history = [];
        const container = document.getElementById('chatHistory');
        container.innerHTML = `
            <div class="chat-message bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                <div class="flex items-start gap-2">
                    <span class="text-xl">🤖</span>
                    <div class="text-sm">
                        <p class="font-bold text-blue-600 mb-1">AI 导师</p>
                        <p class="text-slate-700">你好！我是你的数学学习助手。选择一个函数类型，调节参数，我来给你讲解函数图像的特点！</p>
                        <p class="mt-2 text-slate-400 text-xs">你可以问我："为什么二次函数是抛物线？"</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * 介绍当前函数
     */
    async introduceFunction() {
        if (this.isThinking) return;
        
        this.showThinking();
        
        const func = FUNCTION_TYPES[app.currentType];
        const introPrompt = func.aiPrompts?.intro || `请简要介绍 ${func.name} 的特点和图像性质。`;
        
        try {
            const response = await this.callAI(introPrompt);
            // 替换思考状态为实际消息
            const statusEl = document.getElementById('aiStatus');
            statusEl.classList.add('hidden');
            
            // 添加消息（替换最后一条"思考中"的状态）
            const messages = document.querySelectorAll('#chatHistory .chat-message');
            if (messages.length > 0) {
                messages[messages.length - 1].remove();
            }
            this.addMessage('ai', response);
        } catch (error) {
            this.addMessage('ai', `${func.name} 的公式是 ${func.formula}，试着拖动滑块观察图像变化吧！`);
        }
        
        this.hideThinking();
    },
    
    /**
     * 回答关于参数的问题
     */
    async askAboutParam(paramKey) {
        if (this.isThinking) return;
        
        this.showThinking();
        
        const func = FUNCTION_TYPES[app.currentType];
        let prompt = '';
        
        switch (paramKey) {
            case 'a':
                prompt = func.aiPrompts?.paramA || `请解释参数 a 对 ${func.name} 的影响。`;
                break;
            case 'b':
                prompt = func.aiPrompts?.paramB || `请解释参数 b 对 ${func.name} 的影响。`;
                break;
            case 'c':
                prompt = func.aiPrompts?.paramC || `请解释参数 c 对 ${func.name} 的影响。`;
                break;
            case 'A':
                prompt = func.aiPrompts?.paramA || `请解释振幅 A 对正弦函数的影响。`;
                break;
            case 'omega':
                prompt = func.aiPrompts?.paramOmega || `请解释角频率 ω 对正弦函数周期的影响。`;
                break;
            case 'phi':
                prompt = func.aiPrompts?.paramPhi || `请解释初相 φ 对正弦函数图像的影响。`;
                break;
            case 'k':
                prompt = func.aiPrompts?.paramK || `请解释比例系数 k 对反比例函数的影响。`;
                break;
            default:
                prompt = `请解释参数 ${paramKey} 对 ${func.name} 的影响。`;
        }
        
        try {
            const response = await this.callAI(prompt);
            const statusEl = document.getElementById('aiStatus');
            statusEl.classList.add('hidden');
            
            const messages = document.querySelectorAll('#chatHistory .chat-message');
            if (messages.length > 0) {
                messages[messages.length - 1].remove();
            }
            this.addMessage('ai', response);
        } catch (error) {
            this.addMessage('ai', '抱歉，我暂时无法回答这个问题。');
        }
        
        this.hideThinking();
    }
};

