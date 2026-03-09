import { createElement } from '../utils/dom.js';
import { formatYear, formatDate } from '../utils/dom.js';
import { eventCategories } from '../data/events.js';

export class TimelineComponent {
  constructor(container, events, options = {}) {
    this.container = container;
    this.events = events;
    this.options = {
      minYear: -3000,
      maxYear: 1500,
      pixelsPerYear: 2,
      nodeSpacing: 80,
      ...options,
    };
    
    this.state = {
      zoom: 1,
      offset: 0,
      isDragging: false,
      startX: 0,
      startOffset: 0,
    };
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    this.bindStateListeners();
  }
  
  render() {
    this.container.innerHTML = '';
    
    // 创建时间轴容器
    this.timelineEl = createElement('div', {
      className: 'relative h-full overflow-hidden',
    });
    
    // 背景网格
    this.gridEl = this.createGrid();
    this.timelineEl.appendChild(this.gridEl);
    
    // 时间刻度
    this.scaleEl = this.createScale();
    this.timelineEl.appendChild(this.scaleEl);
    
    // 事件节点层
    this.nodesLayer = createElement('div', {
      className: 'absolute inset-0',
    });
    this.renderEvents();
    this.timelineEl.appendChild(this.nodesLayer);
    
    // 时间轴基准线
    const baseline = createElement('div', {
      className: 'absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-600 via-amber-400 to-slate-600',
    });
    this.timelineEl.appendChild(baseline);
    
    // 导航控制
    this.controlsEl = this.createControls();
    this.timelineEl.appendChild(this.controlsEl);
    
    this.container.appendChild(this.timelineEl);
  }
  
  createGrid() {
    const grid = createElement('div', {
      className: 'absolute inset-0 opacity-20',
    });
    
    const { minYear, maxYear } = this.options;
    const step = this.getGridStep();
    
    for (let year = minYear; year <= maxYear; year += step) {
      const position = this.yearToPosition(year);
      const line = createElement('div', {
        className: 'absolute top-0 bottom-0 w-px bg-slate-600',
        style: { left: `${position}%` },
      });
      grid.appendChild(line);
    }
    
    return grid;
  }
  
  createScale() {
    const scale = createElement('div', {
      className: 'absolute top-4 left-0 right-0 h-8 flex items-center',
    });
    
    const { minYear, maxYear } = this.options;
    const step = this.getGridStep();
    
    for (let year = minYear; year <= maxYear; year += step) {
      const position = this.yearToPosition(year);
      const label = createElement('span', {
        className: 'absolute text-xs text-slate-500 transform -translate-x-1/2',
        style: { left: `${position}%` },
        innerHTML: formatYear({ year, era: year < 0 ? 'BC' : 'AD' }),
      });
      scale.appendChild(label);
    }
    
    return scale;
  }
  
  renderEvents() {
    this.nodesLayer.innerHTML = '';
    
    const visibleEvents = this.getVisibleEvents();
    
    visibleEvents.forEach((event, index) => {
      const position = this.yearToPosition(event.date.year);
      const node = this.createEventNode(event, position, index);
      this.nodesLayer.appendChild(node);
    });
  }
  
  createEventNode(event, positionX, index) {
    const category = eventCategories[event.category] || eventCategories.political;
    const isEven = index % 2 === 0;
    
    const node = createElement('div', {
      className: 'absolute cursor-pointer group',
      style: {
        left: `${positionX}%`,
        top: isEven ? '35%' : '65%',
        transform: 'translateX(-50%)',
      },
      dataset: { eventId: event.id },
    });
    
    // 事件标记点
    const marker = createElement('div', {
      className: `
        w-4 h-4 rounded-full border-2 transition-all duration-300
        ${category.color} border-white/80 hover:scale-125 hover:shadow-lg hover:shadow-amber-400/30
        cursor-pointer
      `,
    });
    node.appendChild(marker);
    
    // 连接线
    const line = createElement('div', {
      className: 'absolute left-1/2 w-0.5 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent',
      style: {
        height: isEven ? 'calc(35% - 16px)' : 'calc(65% - 16px)',
        bottom: isEven ? '50%' : 'auto',
        top: isEven ? 'auto' : '50%',
      },
    });
    node.appendChild(line);
    
    // 悬停预览卡片
    const previewCard = createElement('div', {
      className: `
        absolute left-1/2 transform -translate-x-1/2 w-56 p-3 rounded-lg shadow-xl
        bg-slate-800/95 backdrop-blur-md border border-slate-700/50
        opacity-0 group-hover/marker:opacity-100 transition-all duration-300
        pointer-events-none z-10
        ${isEven ? 'bottom-full mb-2' : 'top-full mt-2'}
      `,
      innerHTML: `
        <div class="flex items-start gap-2">
          <span class="text-lg">${category.icon}</span>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-white text-sm truncate">${event.title}</h4>
            <p class="text-xs text-amber-400 mt-0.5">${formatDate(event.date)}</p>
          </div>
        </div>
        <p class="text-xs text-slate-300 mt-2 line-clamp-2">${event.description}</p>
      `,
    });
    node.appendChild(previewCard);
    
    // 点击事件
    node.addEventListener('click', () => {
      window.store.set('selectedEvent', event);
      window.store.set('ui.sidebarOpen', true);
    });
    
    return node;
  }
  
  createControls() {
    const controls = createElement('div', {
      className: 'absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2',
    });
    
    // 缩小按钮
    const zoomOut = createElement('button', {
      className: 'w-10 h-10 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors',
      innerHTML: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>',
    });
    
    // 缩放滑块
    const zoomSlider = createElement('input', {
      type: 'range',
      min: '0.1',
      max: '5',
      step: '0.1',
      value: '1',
      className: 'w-32 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer',
    });
    
    // 放大按钮
    const zoomIn = createElement('button', {
      className: 'w-10 h-10 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors',
      innerHTML: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>',
    });
    
    // 重置按钮
    const resetBtn = createElement('button', {
      className: 'w-10 h-10 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors ml-2',
      innerHTML: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
    });
    
    controls.append(zoomOut, zoomSlider, zoomIn, resetBtn);
    
    // 绑定事件
    zoomOut.addEventListener('click', () => this.handleZoom(-0.5));
    zoomIn.addEventListener('click', () => this.handleZoom(0.5));
    resetBtn.addEventListener('click', () => this.resetView());
    zoomSlider.addEventListener('input', (e) => {
      this.state.zoom = parseFloat(e.target.value);
      this.updateView();
    });
    
    this.zoomSlider = zoomSlider;
    
    return controls;
  }
  
  bindEvents() {
    // 拖拽事件
    this.timelineEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('.flex.items-center.gap-2')) return;
      this.state.isDragging = true;
      this.state.startX = e.clientX;
      this.state.startOffset = this.state.offset;
      this.timelineEl.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.state.isDragging) return;
      
      const deltaX = e.clientX - this.state.startX;
      const containerWidth = this.timelineEl.offsetWidth;
      this.state.offset = this.state.startOffset + (deltaX / containerWidth) * 100;
      
      this.updateView();
    });
    
    document.addEventListener('mouseup', () => {
      this.state.isDragging = false;
      this.timelineEl.style.cursor = '';
    });
    
    // 滚轮缩放
    this.timelineEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.handleZoom(delta);
    });
  }
  
  bindStateListeners() {
    window.store.subscribe('filteredEvents', () => {
      this.events = window.store.get('filteredEvents');
      this.renderEvents();
    });
    
    window.store.subscribe('selectedEvent', (event) => {
      if (event) {
        this.highlightEvent(event.id);
      }
    });
  }
  
  handleZoom(delta) {
    const newZoom = Math.max(0.1, Math.min(5, this.state.zoom + delta));
    this.state.zoom = newZoom;
    this.zoomSlider.value = newZoom;
    this.updateView();
  }
  
  updateView() {
    const { minYear, maxYear } = this.options;
    const range = (maxYear - minYear) / this.state.zoom;
    const center = minYear + (maxYear - minYear) / 2;
    
    const newMin = center - range / 2;
    const newMax = center + range / 2;
    
    this.options.minYear = newMin;
    this.options.maxYear = newMax;
    
    this.gridEl.remove();
    this.scaleEl.remove();
    this.gridEl = this.createGrid();
    this.scaleEl = this.createScale();
    this.timelineEl.insertBefore(this.gridEl, this.timelineEl.children[1]);
    this.timelineEl.insertBefore(this.scaleEl, this.timelineEl.children[2]);
    
    this.renderEvents();
  }
  
  resetView() {
    this.state.zoom = 1;
    this.state.offset = 0;
    this.options.minYear = -3000;
    this.options.maxYear = 1500;
    this.zoomSlider.value = 1;
    this.updateView();
  }
  
  getGridStep() {
    const range = this.options.maxYear - this.options.minYear;
    if (range > 1000) return 500;
    if (range > 200) return 100;
    if (range > 50) return 10;
    return 5;
  }
  
  yearToPosition(year) {
    const { minYear, maxYear } = this.options;
    return ((year - minYear) / (maxYear - minYear)) * 100 + this.state.offset;
  }
  
  getVisibleEvents() {
    const { minYear, maxYear } = this.options;
    return this.events.filter(event => {
      const year = event.date.year;
      return year >= minYear && year <= maxYear;
    });
  }
  
  highlightEvent(eventId) {
    this.nodesLayer.querySelectorAll('.scale-125').forEach(el => {
      el.classList.remove('scale-125', 'shadow-amber-400/50');
    });
    
    const node = this.nodesLayer.querySelector(`[data-event-id="${eventId}"]`);
    if (node) {
      const marker = node.querySelector('.rounded-full');
      marker.classList.add('scale-125', 'shadow-lg', 'shadow-amber-400/50');
    }
  }
  
  updateEvents(events) {
    this.events = events;
    this.renderEvents();
  }
}

