/**
 * AI 服务模块 - 使用阿里云通义千问 API
 * 
 * API 配置来源: index.html (265-270行)
 * endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
 * model: qwen3-max
 */

// API 配置
const API_CONFIG = {
  apiKey: 'sk-xxx',
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  model: 'qwen3-max',
  timeout: 30000
};

/**
 * 调用 AI 生成回答（流式）
 */
export async function* streamAIChat(messages, options = {}) {
  const { temperature = 0.7, maxTokens = 2000 } = options;
  
  const response = await fetch(`${API_CONFIG.endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: messages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API请求失败: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

/**
 * 调用 AI 生成回答（非流式）
 */
export async function callAI(messages, options = {}) {
  const { temperature = 0.7, maxTokens = 2000 } = options;
  
  const response = await fetch(`${API_CONFIG.endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 生成历史事件相关问题的上下文
 */
export function buildHistoryContext(event, question) {
  const contextMessages = [
    {
      role: 'system',
      content: `你是一个专业的中文历史知识助手。请根据提供的历史事件信息，用生动、易懂的方式回答用户的问题。
      
要求：
1. 回答要有深度，体现你的历史专业素养
2. 语言要生动有趣，适合普通用户理解
3. 如果涉及多个历史时期，可以进行对比分析
4. 回答可以是markdown格式，适当使用列表、强调等
5. 保持客观中立的历史观点`
    }
  ];

  // 添加事件信息
  if (event) {
    const eventInfo = `
## 当前历史事件信息

**事件标题**: ${event.title}
**发生时间**: ${formatYear(event.date)}
**事件分类**: ${event.category}
**重要性**: ${'⭐'.repeat(event.significance)}

**简要描述**:
${event.description}

**关键人物**:
${event.figures?.map(f => `- ${f.name} (${f.title})`).join('\n') || '无记录'}

**发生地点**: ${event.location?.name || '未知'}
    `.trim();

    contextMessages.push({
      role: 'user',
      content: eventInfo
    });
  }

  // 添加用户问题
  contextMessages.push({
    role: 'user',
    content: `\n用户问题: ${question}\n\n请根据以上信息回答：`
  });

  return contextMessages;
}

/**
 * 生成自由历史问答的上下文
 */
export function buildFreeContext(question, chatHistory = []) {
  const messages = [
    {
      role: 'system',
      content: `你是一个专业的中文历史知识助手，专注于中国历史。
      
专长领域：
- 中国古代史（先秦、秦汉、三国、魏晋、隋唐、宋元、明清等）
- 中国近代史（鸦片战争、辛亥革命、抗日战争等）
- 世界历史（古希腊、古罗马、欧洲中世纪、工业革命等）
- 历史人物评价
- 历史事件分析
- 历史与现实的联系

请用专业、生动、易懂的方式回答用户的历史问题。`
    }
  ];

  // 添加历史对话
  messages.push(...chatHistory);
  
  // 添加用户问题
  messages.push({
    role: 'user',
    content: question
  });

  return messages;
}

/**
 * 格式化年份
 */
function formatYear(date) {
  const { year, era } = date;
  const absYear = Math.abs(year);
  const formattedYear = absYear.toLocaleString();
  return era === 'BC' ? `公元前${formattedYear}` : `公元${formattedYear}`;
}

/**
 * 建议问题列表
 */
export function getSuggestedQuestions(event) {
  const baseQuestions = [
    '这个事件对后世有什么影响？',
    '有哪些相关的重要人物？',
    '这个事件发生的背景是什么？',
    '这个事件与哪些其他历史事件有关联？'
  ];

  if (!event) {
    return [
      '请推荐一些中国历史上的重要事件',
      '帮我介绍一个有趣的历史人物',
      '中国古代哪个朝代最强大？',
      '丝绸之路是如何开辟的？'
    ];
  }

  // 根据事件类型添加特定问题
  const categoryQuestions = {
    political: ['这对当时的政治格局有什么影响？', '这个政策是如何制定和实施的？'],
    military: ['这场战役的详细过程是怎样的？', '双方的军事策略有什么特点？'],
    cultural: ['这对当时的文化有什么影响？', '有哪些相关的文学作品？'],
    economic: ['这对当时的经济发展有什么作用？', '涉及了哪些重要的经济政策？'],
    social: ['这对当时的社会结构有什么改变？', '普通人的生活有什么变化？']
  };

  const specific = categoryQuestions[event.category] || [];
  return [...baseQuestions, ...specific].slice(0, 4);
}

// 导出配置（供调试用）
export { API_CONFIG };
