/**
 * AI 对话模块
 * 负责与 AI API 通信，管理对话历史
 */

class AIChatManager {
    constructor() {
        this.conversationHistory = [];
        this.systemPrompt = this.buildSystemPrompt();
        this.isTyping = false;
    }

    /**
     * 构建系统提示词 - 设定 AI 的角色和教学风格
     */
    buildSystemPrompt() {
        return `你是一位高中信息技术老师，专门教学生理解二进制。

你的特点：
1. 耐心、友好、鼓励式教学
2. 善于用生活化的例子解释抽象概念
3. 会根据学生的回答调整教学方式
4. 回答简洁明了，避免过于技术化的术语
5. 喜欢用表情符号让对话更生动

教学范围：
- 二进制与十进制的转换原理
- 位权概念（2⁰, 2¹, 2²...）
- 二进制的实际应用（计算机存储、颜色、网络等）
- 常见误区和错误分析

当前游戏状态说明：
- 目标数值：学生需要用 Bit 块组合出的数字
- Bit 块：1, 2, 4, 8, 16, 32 代表不同位权
- 槽位：学生放置 Bit 块的位置，从右向左位权递减

请用简洁、友好的语气回答学生的问题。如果学生在解题卡住了，可以适当给出提示。

重要：回答时请：
1. 使用表情符号增加亲和力
2. 用换行分隔不同内容
3. 如果是解题提示，给出具体例子
4. 保持回答简短，适合青少年阅读`;
    }

    /**
     * 发送消息给 AI
     * @param {string} userMessage - 用户消息
     * @param {object} context - 上下文信息
     * @returns {Promise<string>} AI 回复
     */
    async sendMessage(userMessage, context = {}) {
        // 构建消息数组
        const messages = [
            { role: 'system', content: this.systemPrompt },
            ...this.conversationHistory,
            { role: 'user', content: this.formatUserMessage(userMessage, context) }
        ];

        try {
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
                    max_tokens: 600,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(`API 请求失败: ${response.status}`);
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                const aiResponse = data.choices[0].message.content;

                // 保存对话历史
                this.conversationHistory.push(
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: aiResponse }
                );

                // 限制历史长度（保留最近 20 条）
                if (this.conversationHistory.length > 20) {
                    this.conversationHistory = this.conversationHistory.slice(-20);
                }

                return aiResponse;
            } else {
                throw new Error('API 返回数据格式异常');
            }

        } catch (error) {
            console.error('AI 请求错误:', error);
            return this.getFallbackResponse(error);
        }
    }

    /**
     * 格式化用户消息，附加上下文
     */
    formatUserMessage(message, context) {
        let fullMessage = message;

        // 添加当前游戏状态
        if (context.currentLevel || context.targetNumber) {
            fullMessage += `\n\n【当前游戏状态】`;
            if (context.currentLevel) fullMessage += `\n- 关卡: ${context.currentLevel}`;
            if (context.targetNumber) fullMessage += `\n- 目标数值: ${context.targetNumber}`;
            if (context.currentSum !== undefined) fullMessage += `\n- 当前总和: ${context.currentSum}`;
            if (context.usedBits && context.usedBits.length) {
                fullMessage += `\n- 已使用的 Bit: ${context.usedBits.filter(v => v > 0).join(', ') || '无'}`;
            }
            if (context.errorCount) fullMessage += `\n- 已错误次数: ${context.errorCount}`;
        }

        return fullMessage;
    }

    /**
     * 获取预设的快捷回复
     */
    async getQuickReply(type, context = {}) {
        const presets = {
            bitWeight: `💡 **位权概念** 💡

位权就是"位置的价值"。

从右向左看：
- 第1位(最右): 2⁰ = 1
- 第2位: 2¹ = 2
- 第3位: 2² = 4
- 第4位: 2³ = 8
- 第5位: 2⁴ = 16
- 第6位: 2⁵ = 32

📌 规律：每向左一位，数值翻倍！

例子：
1101 = 8 + 4 + 0 + 1 = 13`,
            conversion: `🔄 **进制转换方法** 🔄

**十进制转二进制**（除2取余法）：

比如：13 转二进制
13 ÷ 2 = 6 余 1
6 ÷ 2 = 3 余 0
3 ÷ 2 = 1 余 1
1 ÷ 2 = 0 余 1

从下往上读余数：1101 ✓

**二进制转十进制**（位权相加）：

1101 = 1×8 + 1×4 + 0×2 + 1×1 = 13 ✓`,
            usage: `💻 **二进制有什么用？** 💻

计算机用二进制是因为物理实现简单：

1️⃣ **开关原理**
- 0 = 关，1 = 开
- 就像电灯，只有开/关两种状态

2️⃣ **存储单位**
- 1位(bit) = 0或1
- 8位 = 1字节(byte)
- 1024字节 = 1KB

3️⃣ **颜色表示**
- RGB: 红(0-255), 绿(0-255), 蓝(0-255)
- 白色 = 255,255,255 = 二进制全1

4️⃣ **网络地址**
- IP地址也是用二进制表示的！`,
            encouragement: `😊 没关系，学习二进制需要时间！

让我给你一个提示：
从**最大的 Bit** 开始尝试！

比如目标是 25：
- 最大 Bit ≤ 25 的是 16
- 25 - 16 = 9
- 最大 Bit ≤ 9 的是 8
- 9 - 8 = 1
- 1 正好是 Bit

所以 25 = 16 + 8 + 1 ✓

加油，你一定可以！💪`
        };

        return presets[type] || presets.encouragement;
    }

    /**
     * 根据游戏状态生成针对性提示
     */
    generateHint(context) {
        const { targetNumber, currentSum, slots } = context;
        const remaining = targetNumber - currentSum;
        const usedBits = slots.filter(v => v > 0);

        // 还未开始
        if (currentSum === 0) {
            return `🚀 **开始挑战** 🚀

目标是 **${targetNumber}**！

💡 第一步：找到最接近但不超过 ${targetNumber} 的 Bit。

提示：
- 2⁴ = 16
- 2⁵ = 32（太大了！）
- 2³ = 8

试试先放 ${Math.pow(2, Math.floor(Math.log2(targetNumber)))}？`;
        }

        // 已超过
        if (remaining < 0) {
            return `😮 超过目标了！

当前总和: ${currentSum}
目标: ${targetNumber}

💡 建议：
移除你放的最大的 Bit，
试试更小的组合？

${targetNumber} = ? + ? + ?`;
        }

        // 接近成功
        if (remaining > 0 && remaining <= 10) {
            return `🎯 **差一点就对了！** 🎯

还差 **${remaining}**

💡 小提示：
${this.getBitHint(remaining)}

把剩下的 Bit 组合起来试试！`;
        }

        // 分析最优解
        return `💡 **解题思路** 💡

目标 ${targetNumber} = ?

让我帮你分解：
${this.calculateOptimal(targetNumber)}

先放最大的 Bit，然后逐步分解！`;
    }

    /**
     * 获取 Bit 组合提示
     */
    getBitHint(num) {
        const bits = [];
        let remaining = num;
        const weights = [8, 4, 2, 1];

        for (const w of weights) {
            if (remaining >= w) {
                bits.push(w);
                remaining -= w;
            }
        }

        if (remaining === 0) {
            return `可以用：${bits.join(' + ')}`;
        }

        return `试着用 ${weights.join(', ')} 中的数字相加得到 ${num}`;
    }

    /**
     * 计算最优解
     */
    calculateOptimal(target) {
        const parts = [];
        let remaining = target;
        const weights = [32, 16, 8, 4, 2, 1];

        for (const w of weights) {
            if (remaining >= w) {
                parts.push(w);
                remaining -= w;
            }
        }

        return parts.join(' + ');
    }

    /**
     * 出错时的备用回复
     */
    getFallbackResponse(error) {
        if (error.message.includes('401')) {
            return `😟 抱歉，AI 服务暂时无法使用（API 密钥问题）。

你可以：
1. 先自己试试看
2. 查看右侧的快捷问题
3. 稍后再问我

加油！💪`;
        }

        if (error.message.includes('429')) {
            return `😴 AI 老师累了，请稍等片刻再问我吧！

在这之前：
- 试着从小 Bit 开始组合
- 或者直接点击"跳过此题"

加油！🌟`;
        }

        return `😟 抱歉，我暂时有点不舒服。

请稍后再问我，或者：
- 查看💡 小提示按钮
- 点击快捷问题学习概念

祝你游戏愉快！🎮`;
    }

    /**
     * 清空对话历史
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * 获取对话历史长度
     */
    getHistoryLength() {
        return this.conversationHistory.length;
    }
}

// 创建全局实例
window.aiChat = new AIChatManager();

