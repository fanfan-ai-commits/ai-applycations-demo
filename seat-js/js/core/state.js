// 简易响应式状态管理
class StateManager {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Map();
    this.history = [];
    this.historyIndex = -1;
  }
  
  // 获取状态
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }
  
  // 设置状态
  set(path, value) {
    const oldValue = this.get(path);
    if (oldValue === value) return;
    
    // 保存到历史
    this._saveToHistory(path, oldValue);
    
    // 更新状态
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.state);
    target[lastKey] = value;
    
    // 通知监听者
    this._notify(path, value, oldValue);
  }
  
  // 监听状态变化
  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, []);
    }
    this.listeners.get(path).push(callback);
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.listeners.get(path);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }
  
  // 通知监听者
  _notify(path, newValue, oldValue) {
    this.listeners.forEach((callbacks, listenerPath) => {
      if (path.startsWith(listenerPath) || listenerPath === '*') {
        callbacks.forEach(cb => cb(newValue, oldValue, path));
      }
    });
  }
  
  // 保存到历史记录
  _saveToHistory(path, oldValue) {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ path, oldValue, timestamp: Date.now() });
    this.historyIndex++;
    
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  // 撤销
  undo() {
    if (this.historyIndex < 0) return false;
    
    const { path, oldValue } = this.history[this.historyIndex];
    const currentValue = this.get(path);
    
    this._notify(path, oldValue, currentValue);
    this.historyIndex--;
    
    return true;
  }
}

// 创建全局状态
const store = new StateManager({
  currentView: 'timeline',
  
  timeline: {
    zoom: 1,
    offset: 0,
    centerYear: 1900,
    range: { min: -3000, max: 1500 },
  },
  
  filters: {
    era: null,
    category: null,
    searchQuery: '',
  },
  
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  relatedEvents: [],
  
  aiChat: {
    isOpen: false,
    messages: [],
    isLoading: false,
  },
  
  ui: {
    isLoading: true,
    sidebarOpen: false,
  }
});

// 导出 store
window.store = store;

