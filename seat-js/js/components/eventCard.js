import { createElement, formatDate } from '../utils/dom.js';
import { eventCategories } from '../data/events.js';

export class EventCardComponent {
  constructor(container) {
    this.container = container;
    this.render();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="p-4">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm text-amber-400 mb-1">${window.store.get('selectedEvent.date') ? formatDate(window.store.get('selectedEvent.date')) : '选择事件'}</p>
            <h2 class="text-xl font-bold">${window.store.get('selectedEvent.title') || '选择事件'}</h2>
          </div>
          <button id="closePanel" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        ${this.renderContent()}
      </div>
    `;
    
    this.bindEvents();
  }
  
  renderContent() {
    const event = window.store.get('selectedEvent');
    if (!event) {
      return `
        <div class="flex flex-col items-center justify-center h-64 text-slate-500">
          <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p>点击时间轴上的节点查看详情</p>
        </div>
      `;
    }
    
    const category = eventCategories[event.category];
    
    return `
      <!-- 分类标签 -->
      <div class="flex items-center gap-2 mb-4">
        <span class="px-2 py-1 rounded-full text-xs font-medium ${category?.color || 'bg-slate-500'}">
          ${category?.icon || '📌'} ${category?.label || '其他'}
        </span>
        <span class="text-xs text-slate-400">重要性: ${'⭐'.repeat(event.significance || 1)}</span>
      </div>
      
      <!-- 描述 -->
      <p class="text-slate-300 mb-4">${event.description}</p>
      
      <!-- 图片 -->
      ${event.images?.length ? `
        <div class="mb-4 rounded-lg overflow-hidden">
          <img src="${event.images[0]}" alt="${event.title}" class="w-full h-48 object-cover">
        </div>
      ` : ''}
      
      <!-- 详细内容 -->
      <div class="prose prose-invert prose-sm max-w-none mb-6">
        ${event.content || '<p>暂无详细描述</p>'}
      </div>
      
      <!-- 地点 -->
      ${event.location ? `
        <div class="flex items-start gap-2 p-3 bg-slate-700/50 rounded-lg mb-4">
          <svg class="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <div>
            <p class="text-xs text-slate-400">发生地点</p>
            <p class="text-sm">${event.location.name}</p>
          </div>
        </div>
      ` : ''}
      
      <!-- 关键人物 -->
      ${event.figures?.length ? `
        <div class="mb-4">
          <h3 class="text-sm font-medium text-slate-400 mb-2">关键人物</h3>
          <div class="flex flex-wrap gap-2">
            ${event.figures.map(figure => `
              <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full">
                <div class="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold">
                  ${figure.name[0]}
                </div>
                <span class="text-sm">${figure.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- 标签 -->
      ${event.tags?.length ? `
        <div class="flex flex-wrap gap-2 mb-6">
          ${event.tags.map(tag => `
            <span class="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">#${tag}</span>
          `).join('')}
        </div>
      ` : ''}
      
      <!-- AI问答按钮 -->
      <button id="askAI" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        向AI了解更多
      </button>
    `;
  }
  
  bindEvents() {
    const closeBtn = document.getElementById('closePanel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.store.set('ui.sidebarOpen', false);
        window.store.set('selectedEvent', null);
      });
    }
    
    const askAIBtn = document.getElementById('askAI');
    if (askAIBtn) {
      askAIBtn.addEventListener('click', () => {
        window.store.set('aiChat.isOpen', true);
      });
    }
  }
  
  update() {
    this.render();
  }
}

