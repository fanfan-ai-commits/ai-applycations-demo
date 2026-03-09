// ===== AI 服务封装 =====

class AIService {
  constructor() {
    // 阿里云 DashScope 配置
    this.apiEndpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    this.apiKey = localStorage.getItem('dashscope_api_key') || 'sk-xxx';
    this.model = 'qwen3-max';
    this.conversationHistory = [];
    
    // 初始化对话历史
    this.initConversation();
  }
  
  // 初始化系统对话
  initConversation() {
    this.conversationHistory = [
      {
        role: 'system',
        content: `你是一个数学助手，专门帮助用户理解三角函数。
        
请用简洁、易懂的语言解释三角函数概念。可以：
- 解释 sin、cos、tan 的定义和几何意义
- 解释单位圆如何帮助理解三角函数
- 回答常见的三角函数问题
- 结合可视化效果解释当前角度的状态

请用中文回答，保持友好和专业。`
      }
    ];
  }
  
  // 设置 API Key
  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('dashscope_api_key', key);
    document.getElementById('apiKeySection').style.display = 'none';
    this.addMessage('ai', '✅ API Key 已保存！现在你可以问我关于三角函数的问题了。');
  }
  
  // 检查是否已设置 API Key
  hasApiKey() {
    return this.apiKey.length > 0;
  }
  
  // 获取当前三角函数状态
  getCurrentContext() {
    const angle = parseInt(document.getElementById('angleDisplay')?.textContent || '0');
    const radian = parseFloat(document.getElementById('radianDisplay')?.textContent || '0');
    const sin = document.getElementById('sinValue')?.textContent || '0';
    const cos = document.getElementById('cosValue')?.textContent || '0';
    const tan = document.getElementById('tanValue')?.textContent || '0';
    
    return { angle, radian, sin, cos, tan };
  }
  
  // 添加消息到对话历史
  addMessage(role, content) {
    this.conversationHistory.push({ role, content });
    
    // 限制历史长度
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = [
        this.conversationHistory[0],
        ...this.conversationHistory.slice(-19)
      ];
    }
  }
  
  // 发送问题到 AI
  async ask(question) {
    if (!this.hasApiKey()) {
      return '请先设置 DashScope API Key 才能使用 AI 助手功能。';
    }
    
    // 添加用户问题到历史
    this.addMessage('user', question);
    
    // 构建带有当前上下文的消息
    const context = this.getCurrentContext();
    const contextMessage = `\n\n当前可视化状态：\n- 角度: ${context.angle}°\n- 弧度: ${context.radian} rad\n- sin: ${context.sin}\n- cos: ${context.cos}\n- tan: ${context.tan}`;
    
    // 创建带上下文的用户消息
    const messages = [
      ...this.conversationHistory.slice(0, 1), // system prompt
      ...this.conversationHistory.slice(1).map(msg => ({
        role: msg.role,
        content: msg.role === 'user' ? msg.content + contextMessage : msg.content
      }))
    ];
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API 请求失败');
      }
      
      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      // 添加 AI 回答到历史
      this.addMessage('assistant', answer);
      
      return answer;
    } catch (error) {
      console.error('AI Error:', error);
      return `抱歉，出现了一些问题：${error.message}`;
    }
  }
  
  // 快速回答（预设问题）
  getQuickAnswer(type) {
    const context = this.getCurrentContext();
    
    const answers = {
      'what-is-sin': `在单位圆中，sin(正弦) 表示角度对应的 y 坐标值。

几何定义：sin θ = 对边 / 斜边 = y / r

在单位圆中，r = 1，所以 sin θ = y。

当前状态：sin(${context.angle}°) = ${context.sin}`,
      
      'what-is-cos': `在单位圆中，cos(余弦) 表示角度对应的 x 坐标值。

几何定义：cos θ = 邻边 / 斜边 = x / r

在单位圆中，r = 1，所以 cos θ = x。

当前状态：cos(${context.angle}°) = ${context.cos}`,
      
      'what-is-tan': `在单位圆中，tan(正切) 表示 y 坐标与 x 坐标的比值。

几何定义：tan θ = 对边 / 邻边 = y / x = sin θ / cos θ

注意：当 x = 0 时（即 90°、270° 等），tan 值无穷大。

当前状态：tan(${context.angle}°) = ${context.tan}`,
      
      'unit-circle': `单位圆是半径为 1 的圆，原点在圆心。

三角函数与单位圆的关系：
- cos θ = 动点 P 的 x 坐标
- sin θ = 动点 P 的 y 坐标  
- tan θ = y / x（当 x ≠ 0 时）

单位圆的优势：
1. 直观展示三角函数的几何意义
2. 轻松理解三角函数的正负值
3. 帮助记忆特殊角的函数值
4. 为后续学习弧度制打下基础`
    };
    
    return answers[type] || '抱歉，我没有找到相关的预设答案。';
  }
}

// ===== UI 交互处理 =====

// 创建 AI 服务实例
const aiService = new AIService();

// DOM 元素
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');

// 检查是否已有 API Key
if (aiService.hasApiKey()) {
  document.getElementById('apiKeySection').style.display = 'none';
}

// 发送消息
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  
  // 添加用户消息到界面
  addMessageToChat('user', message);
  userInput.value = '';
  
  // 显示加载状态
  const loadingId = addLoadingMessage();
  
  // 获取 AI 回答
  const response = await aiService.ask(message);
  
  // 移除加载消息
  removeLoadingMessage(loadingId);
  
  // 添加 AI 回答到界面
  addMessageToChat('ai', response);
}

// 添加消息到聊天界面
function addMessageToChat(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `rounded-lg p-3 text-sm ${
    role === 'user' 
      ? 'message-user ml-8' 
      : 'message-ai mr-8'
  }`;
  
  // 处理内容中的换行
  const formattedContent = content.replace(/\n/g, '<br>');
  messageDiv.innerHTML = formattedContent;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加加载消息
function addLoadingMessage() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-' + Date.now();
  loadingDiv.className = 'message-ai mr-8 rounded-lg p-3 text-sm';
  loadingDiv.innerHTML = '<div class="loading"></div>';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return loadingDiv.id;
}

// 移除加载消息
function removeLoadingMessage(id) {
  const loadingDiv = document.getElementById(id);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// 事件监听
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// API Key 保存
saveApiKeyBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    aiService.setApiKey(apiKey);
  }
});

// 预设问题按钮（可以通过 HTML 添加更多）
document.addEventListener('DOMContentLoaded', () => {
  // 可以在这里添加更多预设功能
});

