/**
 * API 配置文件
 * 注意：生产环境请勿暴露 API Key，建议使用后端代理
 */

const API_CONFIG = {
    // 阿里云通义千问 API 配置
    apiKey: 'sk-xxx',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen3-max',
    timeout: 30000,

    // 游戏配置
    game: {
        initialScore: 0,
        maxSlots: 6,
        minTarget: 1,
        basePoints: 100,
        timeBonusLimit: 100,
        penaltyPerError: 0
    },

    // 积分配置
    scoring: {
        correctAnswer: 100,
        noHintBonus: 50,
        smallHint: -10,
        detailedHint: -30,
        conceptExplanation: -20,
        skipLevel: -50
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

