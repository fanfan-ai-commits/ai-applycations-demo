/**
 * 函数图像工坊 - 配置文件
 * 
 * 包含：
 * 1. API 配置
 * 2. 函数类型定义
 * 3. 快捷示例数据
 */

// ==================== API 配置 ====================
const API_CONFIG = {
    // 阿里云通义千问 API
    apiKey: 'sk-xxx',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen3-max',
    timeout: 30000,
    
    // API 调用配置
    maxTokens: 600,
    temperature: 0.7,
    systemPrompt: `你是一位经验丰富的中学数学老师，有着10年以上的教学经验。你擅长用生动有趣的方式讲解数学概念，善于用生活中的例子帮助学生理解抽象的数学知识。你总是用温和鼓励的语气与学生交流，适时使用类比和图示来辅助解释。`
};

// ==================== 函数类型定义 ====================
const FUNCTION_TYPES = {
    // 一次函数
    linear: {
        id: 'linear',
        name: '一次函数',
        formula: 'y = ax + b',
        formulaHtml: 'y = <span class="text-yellow-400">a</span>x + <span class="text-green-400">b</span>',
        params: [
            { key: 'a', name: 'a (斜率)', min: -5, max: 5, step: 0.1, default: 1, color: 'yellow' },
            { key: 'b', name: 'b (截距)', min: -10, max: 10, step: 0.5, default: 2, color: 'green' }
        ],
        // 函数计算
        evaluate: (x, params) => params.a * x + params.b,
        // 曲线颜色
        color: '#22c55e',
        colorGradient: ['#16a34a', '#22c55e', '#4ade80'],
        // 函数性质描述
        properties: [
            { icon: '📍', text: '过定点 (0, b)' },
            { icon: '↗️', text: '斜率 a 决定倾斜程度' },
            { icon: '🎯', text: '与 x 轴交于 (-b/a, 0)' },
            { icon: '📈', text: 'a > 0 时递增，a < 0 时递减' }
        ],
        // 关键点计算
        getKeyPoints: (params) => {
            const points = [];
            // y轴截距
            points.push({ x: 0, y: params.b, label: '截距 b' });
            // x轴交点 (避免除以0)
            if (Math.abs(params.a) > 0.001) {
                points.push({ x: -params.b / params.a, y: 0, label: 'x轴交点' });
            }
            return points;
        },
        // 渐近线
        asymptote: null,
        // AI 讲解提示
        aiPrompts: {
            intro: '请用简短的几句话介绍一次函数的特点，特别是斜率 a 和截距 b 的几何意义。',
            paramA: '请详细解释一次函数中斜率 a 的几何意义，a 的正负、大小分别对图像有什么影响？',
            paramB: '请解释一次函数中截距 b 的意义，以及当 b 变化时图像如何变化？',
            life: '请举几个生活中的例子，说明一次函数在日常生活中的应用（如行程问题、单价问题等）。',
            question: '请出一道关于一次函数的选择题或填空题，并给出解析。'
        },
        // 建议显示范围
        defaultRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
    },
    
    // 二次函数
    quadratic: {
        id: 'quadratic',
        name: '二次函数',
        formula: 'y = ax² + bx + c',
        formulaHtml: 'y = <span class="text-red-400">a</span>x² + <span class="text-yellow-400">b</span>x + <span class="text-green-400">c</span>',
        params: [
            { key: 'a', name: 'a (二次项)', min: -3, max: 3, step: 0.1, default: 1, color: 'red' },
            { key: 'b', name: 'b (一次项)', min: -10, max: 10, step: 0.5, default: 0, color: 'yellow' },
            { key: 'c', name: 'c (常数项)', min: -10, max: 10, step: 0.5, default: 0, color: 'green' }
        ],
        evaluate: (x, params) => params.a * x * x + params.b * x + params.c,
        color: '#ef4444',
        colorGradient: ['#dc2626', '#ef4444', '#f87171'],
        properties: [
            { icon: '📍', text: '顶点坐标 (-b/2a, (4ac-b²)/4a)' },
            { icon: '🎯', text: '对称轴 x = -b/2a' },
            { icon: '📐', text: 'a > 0 开口向上，a < 0 开口向下' },
            { icon: '🌟', text: '顶点是最小值(a>0)或最大值(a<0)' }
        ],
        getKeyPoints: (params) => {
            const points = [];
            const h = -params.b / (2 * params.a);
            const k = (4 * params.a * params.c - params.b * params.b) / (4 * params.a);
            // 顶点
            points.push({ x: h, y: k, label: '顶点' });
            // y轴截距
            points.push({ x: 0, y: params.c, label: 'y轴截距' });
            return points;
        },
        asymptote: null,
        aiPrompts: {
            intro: '请用简短的几句话介绍二次函数，重点解释为什么它的图像是抛物线，以及顶点、对称轴的概念。',
            paramA: '二次函数中，参数 a 有什么作用？为什么 a 决定了抛物线的开口方向和开口大小？',
            paramB: '参数 b 在二次函数中有什么几何意义？它与顶点位置有什么关系？',
            parabola: '为什么二次函数的图像一定是抛物线？请用物理抛球的例子来解释。',
            life: '请举几个生活中的抛物线例子（如投篮、喷泉、桥梁等）。',
            question: '请出一道关于二次函数顶点或对称轴的题目。'
        },
        defaultRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
    },
    
    // 反比例函数
    inverse: {
        id: 'inverse',
        name: '反比例函数',
        formula: 'y = k/x',
        formulaHtml: 'y = <span class="text-blue-400">k</span>/x',
        params: [
            { key: 'k', name: 'k (比例系数)', min: -10, max: 10, step: 0.5, default: 4, color: 'blue' }
        ],
        evaluate: (x, params) => x !== 0 ? params.k / x : (params.k > 0 ? Infinity : -Infinity),
        color: '#3b82f6',
        colorGradient: ['#2563eb', '#3b82f6', '#60a5fa'],
        properties: [
            { icon: '🔄', text: '双曲线，两个分支' },
            { icon: '📍', text: 'k > 0 在一、三象限' },
            { icon: '📍', text: 'k < 0 在二、四象限' },
            { icon: '〰️', text: '坐标轴是渐近线，永不相交' }
        ],
        getKeyPoints: (params) => {
            return []; // 反比例函数没有固定的关键点
        },
        asymptote: 'x=0, y=0',
        aiPrompts: {
            intro: '请用简短的几句话介绍反比例函数，为什么它的图像是双曲线？k 的正负有什么影响？',
            paramK: '请解释反比例函数中参数 k 的几何意义，k 如何影响双曲线的位置和形状？',
            hyperbola: '为什么反比例函数的图像叫做双曲线？它与双曲线有什么数学关系？',
            life: '请举几个生活中的反比例关系例子（如速度与时间、面积与边长等）。',
            question: '请出一道关于反比例函数性质的题目。'
        },
        defaultRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
    },
    
    // 正弦函数
    sine: {
        id: 'sine',
        name: '正弦函数',
        formula: 'y = A·sin(ωx + φ)',
        formulaHtml: 'y = <span class="text-purple-400">A</span>·sin(<span class="text-cyan-400">ω</span>x + <span class="text-pink-400">φ</span>)',
        params: [
            { key: 'A', name: 'A (振幅)', min: 0.5, max: 5, step: 0.1, default: 2, color: 'purple' },
            { key: 'omega', name: 'ω (角频率)', min: 0.2, max: 3, step: 0.1, default: 1, color: 'cyan' },
            { key: 'phi', name: 'φ (初相)', min: -Math.PI, max: Math.PI, step: 0.1, default: 0, color: 'pink', isPi: true }
        ],
        evaluate: (x, params) => params.A * Math.sin(params.omega * x + params.phi),
        color: '#a855f7',
        colorGradient: ['#9333ea', '#a855f7', '#c084fc'],
        properties: [
            { icon: '📏', text: '振幅 A = |y| 的最大值' },
            { icon: '🔄', text: '周期 T = 2π/ω' },
            { icon: '📍', text: '初相 φ 决定起始位置' },
            { icon: '🌊', text: '波形在 y = ±A 之间震荡' }
        ],
        getKeyPoints: (params) => {
            const points = [];
            const period = 2 * Math.PI / params.omega;
            const startX = -params.phi / params.omega;
            // 起点
            points.push({ x: startX, y: 0, label: '起点' });
            // 波峰
            points.push({ x: startX + period / 4, y: params.A, label: '波峰' });
            // 零点
            points.push({ x: startX + period / 2, y: 0, label: '零点' });
            // 波谷
            points.push({ x: startX + 3 * period / 4, y: -params.A, label: '波谷' });
            return points;
        },
        asymptote: null,
        aiPrompts: {
            intro: '请用简短的几句话介绍正弦函数，什么是振幅、周期、相位？',
            paramA: '请解释正弦函数中振幅 A 的意义，它如何影响正弦波的形状？',
            paramOmega: '角频率 ω 与周期 T 有什么关系？ω 如何影响正弦波的疏密程度？',
            paramPhi: '初相 φ 对正弦函数图像有什么影响？请举例说明。',
            life: '请举几个生活中的正弦波例子（如声音、潮汐、交流电等）。',
            question: '请出一道关于正弦函数周期或振幅的题目。'
        },
        defaultRange: { xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -5, yMax: 5 }
    },
    
    // 指数函数
    exponential: {
        id: 'exponential',
        name: '指数函数',
        formula: 'y = a^x',
        formulaHtml: 'y = <span class="text-orange-400">a</span><sup>x</sup>',
        params: [
            { key: 'a', name: 'a (底数)', min: 0.1, max: 5, step: 0.1, default: 2, color: 'orange' }
        ],
        evaluate: (x, params) => Math.pow(params.a, x),
        color: '#f59e0b',
        colorGradient: ['#d97706', '#f59e0b', '#fbbf24'],
        properties: [
            { icon: '📍', text: '恒过定点 (0, 1)' },
            { icon: '📈', text: 'a > 1 时单调递增' },
            { icon: '📉', text: '0 < a < 1 时单调递减' },
            { icon: '〰️', text: 'x 轴是水平渐近线' }
        ],
        getKeyPoints: (params) => {
            return [
                { x: 0, y: 1, label: '定点' },
                { x: 1, y: params.a, label: '(1,a)' },
                { x: -1, y: 1 / params.a, label: '(-1,1/a)' }
            ];
        },
        asymptote: 'y=0',
        aiPrompts: {
            intro: '请用简短的几句话介绍指数函数，为什么它恒过 (0, 1) 点？',
            paramA: '底数 a 对指数函数有什么影响？a > 1 和 0 < a < 1 有什么区别？',
            growth: '指数增长有什么特点？请与线性增长、对数增长进行比较。',
            life: '请举几个生活中的指数增长例子（如细胞分裂、细菌繁殖、人口增长、放射性衰变等）。',
            question: '请出一道关于指数函数计算的题目。'
        },
        defaultRange: { xMin: -5, xMax: 5, yMin: -2, yMax: 10 }
    }
};

// ==================== 快捷示例数据 ====================
const QUICK_EXAMPLES = {
    linear: [
        { name: '正比例', params: { a: 2, b: 0 }, desc: '过原点的直线' },
        { name: '一般情况', params: { a: -1, b: 3 }, desc: '斜率为负' },
        { name: '水平线', params: { a: 0, b: 2 }, desc: 'a=0 时为常数函数' }
    ],
    quadratic: [
        { name: '标准抛物线', params: { a: 1, b: 0, c: 0 }, desc: 'y = x²' },
        { name: '开口向下', params: { a: -0.5, b: 0, c: 0 }, desc: 'a < 0' },
        { name: '一般形式', params: { a: 1, b: -4, c: 3 }, desc: '带一次项和常数' }
    ],
    inverse: [
        { name: '一三象限', params: { k: 4 }, desc: 'k > 0' },
        { name: '二四象限', params: { k: -4 }, desc: 'k < 0' },
        { name: '快速衰减', params: { k: 8 }, desc: '|k| 较大' }
    ],
    sine: [
        { name: '标准正弦', params: { A: 1, omega: 1, phi: 0 }, desc: 'y = sin x' },
        { name: '振幅变化', params: { A: 2, omega: 1, phi: 0 }, desc: 'A = 2' },
        { name: '周期变化', params: { A: 1, omega: 2, phi: 0 }, desc: 'ω = 2' },
        { name: '相位平移', params: { A: 1, omega: 1, phi: Math.PI / 2 }, desc: 'φ = π/2' }
    ],
    exponential: [
        { name: '标准形式', params: { a: 2 }, desc: 'y = 2^x' },
        { name: '底数大于1', params: { a: 3 }, desc: '快速增长' },
        { name: '衰减函数', params: { a: 0.5 }, desc: '0 < a < 1' }
    ]
};

// ==================== 视图配置 ====================
const VIEW_CONFIG = {
    minRange: 0.5,
    maxRange: 100,
    zoomFactor: 0.8,
    defaultRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
};

// ==================== 动画配置 ====================
const ANIMATION_CONFIG = {
    duration: 500,
    easing: 'ease-out'
};

// ==================== 工具函数 ====================
/**
 * 格式化数字显示
 */
function formatNumber(num, decimals = 2) {
    if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(decimals);
    return parseFloat(num.toFixed(decimals)).toString();
}

/**
 * 格式化公式中的数字（带符号）
 */
function formatFormulaNumber(num) {
    const formatted = formatNumber(Math.abs(num), 2);
    if (num >= 0) return formatted;
    return `-${formatted}`;
}

/**
 * 判断数字是否有限
 */
function isValidNumber(num) {
    return Number.isFinite(num) && !Number.isNaN(num);
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        FUNCTION_TYPES,
        QUICK_EXAMPLES,
        VIEW_CONFIG,
        ANIMATION_CONFIG,
        formatNumber,
        formatFormulaNumber
    };
}

