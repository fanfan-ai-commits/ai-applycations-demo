import { createElement } from '../utils/dom.js';
import { streamAIChat, buildHistoryContext, getSuggestedQuestions } from '../utils/ai.js';

export class AIChatComponent {
  constructor(container) {
    this.container = container;
    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    this.bindStateListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <!-- 聊天面板 -->
      <div id="chatPanel" class="
        absolute bottom-16 right-0 w-80 h-96 bg-slate-800/95 backdrop-blur-md 
        border border-slate-700 rounded-xl shadow-2xl overflow-hidden
        transform transition-all duration-300 origin-bottom-right
        ${this.isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      ">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-sm">历史小助手</h3>
              <p class="text-xs text-slate-400">AI驱动的历史问答</p>
            </div>
          </div>
          <button id="closeChat" class="text-slate-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- 消息区域 -->
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100%-8rem)]">
          ${this.renderMessages()}
        </div>
        
        <!-- 输入区域 -->
        <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700 bg-slate-800">
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              id="chatInput"
              placeholder="输入问题..." 
              class="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:border-amber-400 transition-colors"
              ${this.isLoading ? 'disabled' : ''}
            >
            <button 
              id="sendMessage"
              class="w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 
                     rounded-lg flex items-center justify-center transition-colors"
              ${this.isLoading ? 'disabled' : ''}
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 浮窗按钮 -->
      <button id="chatToggle" class="
        w-14 h-14 bg-amber-500 hover:bg-amber-400 rounded-full shadow-lg 
        flex items-center justify-center transition-all hover:scale-110
        ${this.isOpen ? 'rotate-90' : ''}
      ">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      </button>
    `;
  }
  
  renderMessages() {
    if (this.messages.length === 0) {
      const event = window.store.get('selectedEvent');
      const suggestions = getSuggestedQuestions(event);
      
      return `
        <div class="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
          <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <p class="text-sm">有什么关于历史的问题想问吗？</p>
          <div class="flex flex-wrap gap-2 justify-center mt-2">
            ${suggestions.map(q => `
              <button class="suggestion-btn px-2 py-1 bg-slate-700 rounded text-xs hover:bg-slate-600 transition-colors" data-question="${q}">
                ${q}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    return this.messages.map(msg => `
      <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="
          max-w-[80%] rounded-2xl px-4 py-2 text-sm
          ${msg.role === 'user' 
            ? 'bg-amber-500 text-white rounded-br-md' 
            : 'bg-slate-700 text-slate-200 rounded-bl-md'}
          ${msg.isLoading ? 'animate-pulse' : ''}
        ">
          ${msg.content || '<span class="text-slate-400">思考中...</span>'}
        </div>
      </div>
    `).join('');
  }
  
  bindEvents() {
    // 切换聊天面板
    document.getElementById('chatToggle')?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.render();
    });
    
    // 关闭聊天面板
    document.getElementById('closeChat')?.addEventListener('click', () => {
      this.isOpen = false;
      this.render();
    });
    
    // 发送消息
    const sendBtn = document.getElementById('sendMessage');
    const input = document.getElementById('chatInput');
    
    const sendMessage = async () => {
      const content = input.value.trim();
      if (!content || this.isLoading) return;
      
      this.addMessage('user', content);
      input.value = '';
      
      await this.handleAIResponse(content);
    };
    
    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // 建议问题点击
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        if (this.isOpen) {
          input.value = question;
          sendMessage();
        }
      });
    });
  }
  
  bindStateListeners() {
    window.store.subscribe('aiChat.isOpen', (isOpen) => {
      this.isOpen = isOpen;
      this.render();
    });
  }
  
  addMessage(role, content, isLoading = false) {
    this.messages.push({ role, content, isLoading });
    this.updateMessages();
  }
  
  updateMessages() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.innerHTML = this.renderMessages();
      container.scrollTop = container.scrollHeight;
    }
  }
  
  async handleAIResponse(userQuestion) {
    this.isLoading = true;
    this.addMessage('assistant', '', true);
    this.updateMessages();
    
    try {
      const selectedEvent = window.store.get('selectedEvent');
      
      // 构建上下文
      const messages = buildHistoryContext(selectedEvent, userQuestion);
      
      // 流式获取AI响应
      let fullResponse = '';
      
      for await (const chunk of streamAIChat(messages)) {
        fullResponse += chunk;
        this.messages[this.messages.length - 1].content = fullResponse;
        this.updateMessages();
      }
      
      this.messages[this.messages.length - 1].isLoading = false;
      this.updateMessages();
      
    } catch (error) {
      console.error('AI响应错误:', error);
      this.messages[this.messages.length - 1].content = `抱歉，发生了错误：${error.message}`;
      this.messages[this.messages.length - 1].isLoading = false;
      this.updateMessages();
    }
    
    this.isLoading = false;
  }
  
  update() {
    this.render();
  }
}

