/**
 * 对话系统 - AI对话交互
 * 处理用户消息、AI回复和快捷问题
 */

class ConversationManager {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.userInput = document.getElementById('user-input');
        this.loading = document.getElementById('loading');
        
        this.conversationHistory = [];
        this.currentTopic = 'flux';
        
        // 绑定this
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    
    /**
     * 初始化对话系统
     */
    init() {
        // 绑定事件
        if (this.userInput) {
            this.userInput.addEventListener('keypress', this.handleKeyPress);
        }
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }
    
    /**
     * 发送消息
     */
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;
        
        // 添加用户消息
        this.addUserMessage(message);
        
        // 清空输入框
        this.userInput.value = '';
        
        // 显示加载动画
        this.showLoading();
        
        // 模拟AI回复（实际项目中应该调用API）
        await this.getAIReply(message);
        
        // 隐藏加载动画
        this.hideLoading();
    }
    
    /**
     * 添加用户消息
     */
    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message flex justify-end fade-in';
        messageDiv.innerHTML = `
            <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-none p-3 max-w-64">
                <p class="text-sm">${this.escapeHtml(message)}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 ml-2">
                <span class="text-indigo-600 text-sm">我</span>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // 保存到历史
        this.conversationHistory.push({
            role: 'user',
            content: message
        });
    }
    
    /**
     * 添加AI消息
     */
    addAIMessage(message, quickReplies = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message fade-in';
        messageDiv.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span class="text-indigo-600 text-sm">🤖</span>
                </div>
                <div class="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-64">
                    <div class="text-sm text-gray-700 typing-effect">${message}</div>
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // 保存到历史
        this.conversationHistory.push({
            role: 'assistant',
            content: message
        });
        
        // 添加快捷回复按钮
        if (quickReplies.length > 0) {
            this.addQuickReplies(quickReplies);
        }
        
        return messageDiv;
    }
    
    /**
     * 添加快捷回复按钮
     */
    addQuickReplies(replies) {
        const container = document.createElement('div');
        container.className = 'flex flex-wrap gap-2 mt-2 ml-11';
        container.innerHTML = replies.map(reply => `
            <button onclick="conversationManager.handleQuickReply('${this.escapeHtml(reply)}')"
                    class="px-3 py-1 text-xs bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm">
                ${this.escapeHtml(reply)}
            </button>
        `).join('');
        
        this.chatContainer.appendChild(container);
        this.scrollToBottom();
    }
    
    /**
     * 处理快捷回复点击
     */
    handleQuickReply(message) {
        // 隐藏已点击的快捷回复
        event.target.style.display = 'none';
        this.sendMessageWithText(message);
    }
    
    /**
     * 发送快捷问题
     */
    sendMessageWithText(message) {
        // 添加用户消息
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message flex justify-end fade-in';
        messageDiv.innerHTML = `
            <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-none p-3 max-w-64">
                <p class="text-sm">${this.escapeHtml(message)}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 ml-2">
                <span class="text-indigo-600 text-sm">我</span>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // 显示加载动画
        this.showLoading();
        
        // 获取AI回复
        setTimeout(async () => {
            await this.getAIReply(message);
            this.hideLoading();
        }, 500);
    }
    
    /**
     * 获取AI回复（模拟）
     * 实际项目中应该调用真实的AI API
     */
    async getAIReply(userMessage) {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const reply = this.generateReply(userMessage);
        const quickReplies = this.generateQuickReplies(userMessage);
        
        this.addAIMessage(reply, quickReplies);
    }
    
    /**
     * 生成回复内容（基于规则）
     * 实际项目中应该使用AI模型
     */
    generateReply(message) {
        const lowerMessage = message.toLowerCase();
        
        // 磁通量相关
        if (lowerMessage.includes('磁通量') || lowerMessage.includes('φ')) {
            return `磁通量是描述**穿过某一面积的磁场强弱和方向**的物理量。

📐 **计算公式**：
$$\\Phi = B \\cdot S \\cdot \\cos\\theta$$

其中：
- \(B\) 是磁感应强度
- \(S\) 是线圈面积  
- \(\\theta\) 是磁场方向与线圈法线的夹角

💡 **关键理解**：只有**垂直穿过**线圈的磁感线才算数！`;
        }
        
        // 楞次定律相关
        if (lowerMessage.includes('楞次定律') || lowerMessage.includes('方向')) {
            return `**楞次定律**是判断感应电流方向的重要规律！

📖 **口诀记忆**：
> "增反减同，来拒去留"

🔍 **具体含义**：
- **增反**：磁通量**增加**时，感应磁场的方向与原磁场**相反**
- **减同**：磁通量**减少**时，感应磁场的方向与原磁场**相同**
- **来拒去留**：磁铁**靠近**线圈时，线圈**拒绝**（产生斥力）
- **来拒去留**：磁铁**远离**线圈时，线圈**挽留**（产生引力）`;
        }
        
        // 法拉第定律相关
        if (lowerMessage.includes('法拉第') || lowerMessage.includes('感应电动势') || lowerMessage.includes('ε')) {
            return `**法拉第电磁感应定律**是电磁感应的核心公式！

📊 **数学表达式**：
$$\\varepsilon = -\\frac{\\Delta\\Phi}{\\Delta t}$$

💡 **物理意义**：
- 感应电动势的大小与**磁通量变化率**成正比
- 负号表示**楞次定律**（感应电流的方向）

⚠️ **常见错误**：不要忘记公式中的**负号**，它表示方向！`;
        }
        
        // 右手定则
        if (lowerMessage.includes('右手定则') || lowerMessage.includes('右手')) {
            return `**右手定则**用于判断**动生电动势**的方向！

✋ **使用方法**：
1. 右手平展，使大拇指与四指垂直
2. 磁感线从手心穿入
3. 大拇指指向导体运动方向
4. 四指所指方向就是感应电流方向

🔄 **与左手定则的区别**：
- **右手定则**：判断感应电流（发电机原理）
- **左手定则**：判断安培力（电动机原理）`;
        }
        
        // 默认回复
        return `这是一个很好的问题！

关于**${this.getCurrentTopicName()}**，我建议从以下几个方面理解：

1️⃣ **基本概念**：理解物理量的定义和物理意义

2️⃣ **核心公式**：掌握公式的适用条件和推导过程

3️⃣ **典型例题**：通过具体题目加深理解

你想先了解哪部分？或者有具体的题目想让我讲解吗？`;
    }
    
    /**
     * 生成快捷回复建议
     */
    generateQuickReplies(message) {
        const lowerMessage = message.toLowerCase();
        const quickReplies = [];
        
        if (lowerMessage.includes('磁通量')) {
            quickReplies.push('磁通量为0是什么意思？');
            quickReplies.push('磁通量怎么计算？');
            quickReplies.push('看磁通量动画');
        }
        
        if (lowerMessage.includes('楞次定律')) {
            quickReplies.push('楞次定律和右手定则的区别？');
            quickReplies.push('看楞次定律动画');
            quickReplies.push('楞次定律怎么判断方向？');
        }
        
        if (lowerMessage.includes('法拉第')) {
            quickReplies.push('公式里的负号什么意思？');
            quickReplies.push('感生电动势和动生电动势？');
            quickReplies.push('用法拉第定律解题');
        }
        
        if (quickReplies.length === 0) {
            quickReplies.push('什么是磁通量？');
            quickReplies.push('楞次定律怎么用？');
            quickReplies.push('法拉第定律公式');
            quickReplies.push('看动画演示');
        }
        
        return quickReplies;
    }
    
    /**
     * 获取当前话题名称
     */
    getCurrentTopicName() {
        const topicNames = {
            'flux': '磁通量',
            'induction': '电磁感应',
            'faraday': '法拉第电磁感应定律',
            'lenz': '楞次定律',
            'right-hand': '右手定则',
            'induced-emf': '感生电动势',
            'motion-emf': '动生电动势',
            'self-induction': '自感现象'
        };
        
        return topicNames[this.currentTopic] || '电磁感应';
    }
    
    /**
     * 设置当前话题
     */
    setCurrentTopic(topic) {
        this.currentTopic = topic;
    }
    
    /**
     * 滚动到底部
     */
    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    /**
     * 显示加载动画
     */
    showLoading() {
        if (this.loading) {
            this.loading.classList.remove('hidden');
            this.loading.classList.add('flex');
        }
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        if (this.loading) {
            this.loading.classList.add('hidden');
            this.loading.classList.remove('flex');
        }
    }
    
    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 清空对话
     */
    clearConversation() {
        this.chatContainer.innerHTML = `
            <div class="ai-message">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-indigo-600 text-sm">🤖</span>
                    </div>
                    <div class="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-64">
                        <p class="text-sm text-gray-700">
                            你好！我是你的电磁感应学习助手。有什么不理解的地方可以问我，我会用通俗易懂的方式为你讲解。
                        </p>
                    </div>
                </div>
            </div>
        `;
        this.conversationHistory = [];
    }
    
    /**
     * 获取对话历史
     */
    getHistory() {
        return [...this.conversationHistory];
    }
}

// 创建全局实例
const conversationManager = new ConversationManager();

