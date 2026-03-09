// DOM 操作工具函数

// 创建元素
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // 设置属性
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // 添加子元素
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// 批量渲染列表
export function renderList(container, items, renderItem, keyExtractor) {
  container.innerHTML = '';
  
  if (!items || items.length === 0) {
    container.appendChild(createElement('div', {
      className: 'flex items-center justify-center h-32 text-slate-500',
      innerHTML: '暂无数据'
    }));
    return;
  }
  
  items.forEach(item => {
    const element = renderItem(item);
    element.dataset.key = keyExtractor(item);
    container.appendChild(element);
  });
}

// 防抖函数
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 平滑滚动到元素
export function scrollToElement(element, container, offset = 0) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const targetScroll = container.scrollTop + elementRect.top - containerRect.top - offset;
  
  container.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
}

// 格式化年份显示
export function formatYear(date) {
  const { year, era } = date;
  const absYear = Math.abs(year);
  const formattedYear = absYear.toLocaleString();
  return era === 'BC' ? `公元前${formattedYear}` : `公元${formattedYear}`;
}

// 格式化日期
export function formatDate(date) {
  const { year, month, day, era } = date;
  let result = formatYear({ year, era });
  if (month) result += `${month}月`;
  if (day) result += `${day}日`;
  return result;
}

// 淡入动画
export function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-out`;
  requestAnimationFrame(() => {
    element.style.opacity = '1';
  });
  return element;
}

// 淡出动画
export function fadeOut(element, duration = 300) {
  return new Promise(resolve => {
    element.style.transition = `opacity ${duration}ms ease-in`;
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.display = 'none';
      resolve();
    }, duration);
  });
}

// 添加加载状态
export function showLoading(container) {
  const loader = createElement('div', {
    className: 'flex items-center justify-center p-8',
    innerHTML: `
      <div class="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      <span class="ml-2 text-slate-400">加载中...</span>
    `
  });
  container.appendChild(loader);
  return loader;
}

// 移除加载状态
export function hideLoading(loader) {
  if (loader && loader.parentNode) {
    loader.parentNode.removeChild(loader);
  }
}

// Toast 提示
export function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

