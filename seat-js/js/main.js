// 导入数据
import { historicalEvents } from './data/events.js';
import { TimelineComponent } from './components/timeline.js';
import { EventCardComponent } from './components/eventCard.js';
import { AIChatComponent } from './components/aiChat.js';

// 初始化应用
class HistoryTimelineApp {
  constructor() {
    this.timeline = null;
    this.eventCard = null;
    this.aiChat = null;
    
    this.init();
  }
  
  async init() {
    // 模拟数据加载
    await this.loadData();
    
    // 初始化组件
    this.initComponents();
    
    // 初始化视图
    this.initViews();
    
    // 绑定全局事件
    this.bindGlobalEvents();
    
    // 隐藏加载界面
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 300);
      }
    }, 500);
  }
  
  async loadData() {
    // 设置初始数据
    window.store.set('events', historicalEvents);
    window.store.set('filteredEvents', historicalEvents);
  }
  
  initComponents() {
    // 时间轴组件
    const timelineContainer = document.getElementById('viewContainer');
    this.timeline = new TimelineComponent(
      timelineContainer,
      historicalEvents,
      { minYear: -3000, maxYear: 1500 }
    );
    
    // 事件卡片组件
    const detailPanel = document.getElementById('detailPanel');
    this.eventCard = new EventCardComponent(detailPanel);
    
    // AI对话组件
    const aiChatWidget = document.getElementById('aiChatWidget');
    this.aiChat = new AIChatComponent(aiChatWidget);
  }
  
  initViews() {
    this.switchView('timeline');
  }
  
  switchView(viewName) {
    window.store.set('currentView', viewName);
    
    // 更新视图切换按钮状态
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    
    // 切换主视图
    const container = document.getElementById('viewContainer');
    
    switch (viewName) {
      case 'timeline':
        container.innerHTML = '';
        this.timeline = new TimelineComponent(
          container,
          window.store.get('filteredEvents'),
          { minYear: -3000, maxYear: 1500 }
        );
        break;
        
      case 'network':
        container.innerHTML = `
          <div class="flex items-center justify-center h-full text-slate-500">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <p class="text-lg">知识网络视图</p>
              <p class="text-sm mt-2">展示历史事件之间的关联</p>
            </div>
          </div>
        `;
        break;
        
      case 'map':
        container.innerHTML = `
          <div class="flex items-center justify-center h-full text-slate-500">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <p class="text-lg">地图视图</p>
              <p class="text-sm mt-2">按地理位置展示历史事件</p>
            </div>
          </div>
        `;
        break;
    }
  }
  
  bindGlobalEvents() {
    // 视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView(btn.dataset.view);
      });
    });
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (!query) {
          window.store.set('filteredEvents', historicalEvents);
          return;
        }
        
        const filtered = historicalEvents.filter(event => {
          return event.title.toLowerCase().includes(query) ||
                 event.description.toLowerCase().includes(query) ||
                 event.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                 event.figures?.some(f => f.name.toLowerCase().includes(query));
        });
        
        window.store.set('filteredEvents', filtered);
        
        // 更新时间轴
        if (this.timeline) {
          this.timeline.updateEvents(filtered);
        }
      });
    }
    
    // 时代筛选
    const eraFilter = document.getElementById('eraFilter');
    if (eraFilter) {
      eraFilter.addEventListener('change', (e) => {
        const eraId = e.target.value;
        
        if (!eraId) {
          window.store.set('filteredEvents', historicalEvents);
        } else {
          const eraRanges = {
            'pre_qin': { min: -3000, max: -221 },
            'qin_han': { min: -221, max: 220 },
            'three_kingdoms': { min: 220, max: 420 },
            'sui_tang': { min: 581, max: 907 },
            'song_yuan': { min: 960, max: 1368 },
            'ming_qing': { min: 1368, max: 1912 }
          };
          
          const range = eraRanges[eraId];
          if (range) {
            const filtered = historicalEvents.filter(event => {
              const year = event.date.year;
              return year >= range.min && year <= range.max;
            });
            window.store.set('filteredEvents', filtered);
            
            if (this.timeline) {
              this.timeline.updateEvents(filtered);
            }
          }
        }
      });
    }
    
    // 监听侧边栏状态
    window.store.subscribe('ui.sidebarOpen', (isOpen) => {
      const panel = document.getElementById('detailPanel');
      if (panel) {
        if (isOpen) {
          panel.classList.remove('translate-x-full');
        } else {
          panel.classList.add('translate-x-full');
        }
      }
    });
    
    // 监听选中事件变化
    window.store.subscribe('selectedEvent', () => {
      this.eventCard?.update();
    });
    
    // 监听筛选变化
    window.store.subscribe('filteredEvents', (events) => {
      if (this.timeline) {
        this.timeline.updateEvents(events);
      }
    });
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HistoryTimelineApp();
});

