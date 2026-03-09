/**
 * AI服务 - 阿里云千问3模型API调用
 */

// API配置
const API_CONFIG = {
  apiKey: '',
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  model: 'qwen3-max',
  timeout: 30000
};

// 综合分析提示词
const PROMPTS = {
  resumeAnalysis: `你是一个专业的HR招聘专家和职业发展顾问。请对以下简历进行深度分析评估。

## 简历内容
{resumeText}

## 分析要求
请从以下维度进行全面分析：

### 1. 基本信息提取
- 姓名
- 求职意向/目标职位
- 工作年限
- 教育背景

### 2. 综合评分 (0-100分)
对以下四个维度分别评分：
- 技能匹配度：候选人的技能与岗位要求的匹配程度
- 经验相关性：工作经验与目标岗位的相关性
- 教育背景：学历及专业背景的匹配度
- 项目经历：项目经验的丰富度和质量

### 3. 推荐等级
- 强烈推荐：各项指标优秀，非常匹配
- 推荐：基本匹配，可以考虑
- 考虑：有些不足，需要进一步评估
- 不推荐：明显不匹配

### 4. 候选人优势
列出3-5个候选人的突出优势

### 5. 优化建议
针对简历和候选人情况，给出3-5条具体的改进建议

### 6. 面试问题推荐
基于简历内容，推荐5个面试问题（涵盖技术能力、项目经验、团队协作等方面）

### 7. 技能标签
列出候选人涉及的技能/技术栈标签（主要技能+次要技能）

### 8. 简历完整度检查
检查以下项目是否出现在简历中：
- 个人信息（姓名、联系方式）
- 教育背景
- 工作经历
- 项目经验
- 技能特长
- 自我评价
- 证书资质

### 9. 薪资参考
根据工作年限、技能水平、经验质量，给出薪资范围估算（以人民币/月为单位）

### 10. AI综合评价
给出一段综合性的评价总结

## 输出格式 (JSON)
请严格按照JSON格式返回，不要添加任何其他内容：
{
  "basicInfo": {
    "name": "姓名",
    "title": "目标职位",
    "experienceYears": 工作年限数字,
    "education": "学历专业"
  },
  "scores": {
    "overall": 综合分数,
    "skills": 技能匹配分数,
    "experience": 经验相关分数,
    "education": 教育背景分数,
    "projects": 项目经历分数
  },
  "recommendation": "强烈推荐/推荐/考虑/不推荐",
  "strengths": ["优势1", "优势2", "优势3", "优势4", "优势5"],
  "improvements": ["建议1", "建议2", "建议3", "建议4", "建议5"],
  "interviewQuestions": [
    {"question": "问题内容", "category": "技术能力/项目经验/团队协作/职业规划/其他"}
  ],
  "skillTags": {
    "primary": ["核心技能1", "核心技能2"],
    "secondary": ["次要技能1", "次要技能2"]
  },
  "completeness": {
    "personalInfo": true/false,
    "education": true/false,
    "workExperience": true/false,
    "projects": true/false,
    "skills": true/false,
    "selfEvaluation": true/false,
    "certificates": true/false
  },
  "salary": {
    "min": 最低薪资,
    "max": 最高薪资,
    "currency": "CNY",
    "unit": "月",
    "level": "初级/中级/高级/资深"
  },
  "summary": "综合评价的一段总结性文字（100-200字）"
}

## 注意事项
- 所有数值评分请使用数字，不要使用百分号
- 薪资范围要符合当前市场行情
- 问题推荐要具体、可操作
- 优势和优化建议要有针对性
`

};

// 用户提示词模板
const USER_PROMPT = `请分析这份简历，给出详细的评估报告。`;

class AIService {
  constructor() {
    this.loadApiKey();
  }

  /**
   * 加载API密钥
   */
  loadApiKey() {
    const savedKey = localStorage.getItem('qwen_api_key');
    if (savedKey) {
      API_CONFIG.apiKey = savedKey;
    }
  }

  /**
   * 设置API密钥
   */
  setApiKey(key) {
    API_CONFIG.apiKey = key;
    localStorage.setItem('qwen_api_key', key);
  }

  /**
   * 检查是否已配置
   */
  isConfigured() {
    return API_CONFIG.apiKey && API_CONFIG.apiKey.length > 0;
  }

  /**
   * 调用API
   */
  async call(systemPrompt, userPrompt, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('请先配置API密钥');
    }

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API错误: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API错误: ${data.error.message}`);
    }

    return data.choices[0].message.content;
  }

  /**
   * 解析JSON响应
   */
  parseJSONResponse(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error('无法解析AI返回的JSON数据');
        }
      }
      throw new Error('AI返回的数据不是有效的JSON格式');
    }
  }

  /**
   * 分析简历
   */
  async analyzeResume(resumeText) {
    const systemPrompt = PROMPTS.resumeAnalysis.replace('{resumeText}', resumeText);
    const userPrompt = USER_PROMPT;

    const result = await this.call(systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 4000
    });

    return this.parseJSONResponse(result);
  }

  /**
   * 估算成本
   */
  estimateCost(inputTokens, outputTokens) {
    const price = { input: 0.02, output: 0.06 }; // 千问3-Max
    const cost = (inputTokens / 1000) * price.input + (outputTokens / 1000) * price.output;
    return `约 ¥${cost.toFixed(4)}`;
  }
}

// 导出实例
window.aiService = new AIService();
