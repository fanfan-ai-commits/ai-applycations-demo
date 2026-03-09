/**
 * 智能提示系统
 * 根据游戏状态提供不同级别的帮助
 */

class HintSystem {
    constructor(game) {
        this.game = game;
        this.hintCosts = {
            small: API_CONFIG.scoring.smallHint,
            detailed: API_CONFIG.scoring.detailedHint,
            answer: API_CONFIG.scoring.conceptExplanation
        };
    }

    /**
     * 分析当前状态，给出最适合的提示
     */
    analyzeAndGiveHint() {
        const { targetNumber, currentSum, slots } = this.game;
        const remaining = targetNumber - currentSum;
        const usedBits = slots.filter(v => v > 0);

        // 情况1：还没开始
        if (currentSum === 0) {
            return this.getHint('notStarted', { targetNumber });
        }

        // 情况2：已经超过
        if (remaining < 0) {
            return this.getHint('over', { currentSum, targetNumber, usedBits });
        }

        // 情况3：接近成功（差10以内）
        if (remaining > 0 && remaining <= 10) {
            return this.getHint('almost', { remaining });
        }

        // 情况4：使用了正确的大数但卡住了
        const maxUsedBit = Math.max(...usedBits);
        const expectedMaxBit = Math.pow(2, Math.floor(Math.log2(targetNumber)));
        
        if (maxUsedBit === expectedMaxBit && remaining > 0) {
            return this.getHint('correctPath', { remaining });
        }

        // 情况5：使用了错误的大数
        if (maxUsedBit > expectedMaxBit) {
            return this.getHint('wrongBigBit', { maxUsedBit, expectedMaxBit, targetNumber });
        }

        // 情况6：还没用到大数
        if (maxUsedBit < expectedMaxBit && remaining > expectedMaxBit) {
            return this.getHint('useBigBit', { expectedMaxBit, remaining, targetNumber });
        }

        // 默认：分析最优解
        return this.getHint('optimal', { targetNumber });
    }

    /**
     * 获取指定类型的提示
     */
    getHint(type, data) {
        const hints = {
            notStarted: {
                title: '🚀 开始挑战',
                message: `目标是 **${data.targetNumber}**！

💡 第一步：找到最接近但不超过 ${data.targetNumber} 的 Bit。

${this.getBitOptions(data.targetNumber)}

提示：从 ${Math.pow(2, Math.floor(Math.log2(data.targetNumber)))} 开始试试？`,
                cost: Math.abs(API_CONFIG.scoring.smallHint)
            },
            over: {
                title: '😮 超过目标了！',
                message: `当前总和是 ${data.currentSum}，超过了目标 ${data.targetNumber}。

💡 建议：
移除最大的 Bit（${Math.max(...data.usedBits)}），
试试更小的组合！

${data.targetNumber} = ${data.targetNumber} + 0 = ${data.targetNumber}`,
                cost: Math.abs(API_CONFIG.scoring.smallHint)
            },
            almost: {
                title: '🎯 差一点就对了！',
                message: `还差 **${data.remaining}**！

💡 小提示：
用 ${this.getBitCombination(data.remaining)} 可以凑出 ${data.remaining}

看看你的 Bit 仓库里有没有这些数字？`,
                cost: Math.abs(API_CONFIG.scoring.smallHint)
            },
            correctPath: {
                title: '✅ 思路正确！',
                message: `你已经用对了最大的 Bit！
现在还差 ${data.remaining}。

💡 继续分解：
${this.getBitCombination(data.remaining)}

${this.getHintForNumber(data.remaining)}`,
                cost: Math.abs(API_CONFIG.scoring.smallHint)
            },
            wrongBigBit: {
                title: '💡 换个思路',
                message: `你用了 ${data.maxUsedBit}，但 ${data.targetNumber} - ${data.maxUsedBit} = ${data.targetNumber - data.maxUsedBit} 不太好凑。

💡 试试更小的：
${data.expectedMaxBit} 怎么样？

${data.targetNumber} - ${data.expectedMaxBit} = ${data.targetNumber - data.expectedMaxBit}`,
                cost: Math.abs(API_CONFIG.scoring.smallHint)
            },
            useBigBit: {
                title: '💡 用大 Bit 试试',
                message: `${data.expectedMaxBit} 还没用过！

${data.targetNumber} - ${data.expectedMaxBit} = ${data.remaining}

先放 ${data.expectedMaxBit}，然后再凑 ${data.remaining}！`,
                cost: Math.abs(API_CONFIG.scoring.smallHint)
            },
            optimal: {
                title: '✨ 最优解思路',
                message: `让我帮你分解 **${data.targetNumber}**：

**方法：从大到小尝试**

${this.calculateOptimal(data.targetNumber)}

这就是最优组合！🎉`,
                cost: Math.abs(API_CONFIG.scoring.detailedHint)
            },
            explanation: {
                title: '📖 详细讲解',
                message: `**二进制解题步骤**：

1️⃣ **找最大 Bit**
   - 找到不超过目标的最大 Bit
   
2️⃣ **相减**
   - 目标 - 使用的 Bit = 剩余

3️⃣ **重复**
   - 对剩余数重复步骤1-2

4️⃣ **验证**
   - 确保所有 Bit 加起来等于目标`,
                cost: Math.abs(API_CONFIG.scoring.detailedHint)
            }
        };

        return hints[type] || hints.optimal;
    }

    /**
     * 获取 Bit 选项提示
     */
    getBitOptions(target) {
        const options = [];
        const bits = [1, 2, 4, 8, 16, 32];

        for (const bit of bits) {
            if (bit <= target) {
                options.push(bit);
            }
        }

        return `可用 Bit: ${options.join(', ')}`;
    }

    /**
     * 获取数字的 Bit 组合提示
     */
    getBitCombination(num) {
        const parts = [];
        let remaining = num;
        const weights = [8, 4, 2, 1];

        for (const w of weights) {
            if (remaining >= w) {
                parts.push(w);
                remaining -= w;
            }
        }

        return parts.length > 0 ? parts.join(' + ') : '无法用当前 Bit 凑出';
    }

    /**
     * 获取特定数字的提示
     */
    getHintForNumber(num) {
        const hints = {
            1: '1 就是 Bit 1！',
            2: '2 就是 Bit 2！',
            3: '3 = 2 + 1，用 Bit 2 和 Bit 1',
            4: '4 就是 Bit 4！',
            5: '5 = 4 + 1',
            6: '6 = 4 + 2',
            7: '7 = 4 + 2 + 1',
            8: '8 就是 Bit 8！',
            9: '9 = 8 + 1',
            10: '10 = 8 + 2',
            11: '11 = 8 + 2 + 1',
            12: '12 = 8 + 4',
            13: '13 = 8 + 4 + 1',
            14: '14 = 8 + 4 + 2',
            15: '15 = 8 + 4 + 2 + 1'
        };

        return hints[num] || `试试分解 ${num} = ? + ?`;
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
                parts.push(`${w} (2^${Math.log2(w)})`);
                remaining -= w;
            }
        }

        return `**${target}** = ${parts.join(' + ')}`;
    }

    /**
     * 生成二进制表示
     */
    getBinaryRepresentation(target) {
        return `${target} 的二进制是：${target.toString(2)}`;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HintSystem;
}

