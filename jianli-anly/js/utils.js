/**
 * 工具函数集
 */

const Utils = {
  /**
   * 格式化数字
   */
  formatNumber(num) {
    return num.toLocaleString('zh-CN');
  },

  /**
   * 格式化百分比
   */
  formatPercent(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
  },

  /**
   * 获取分数对应的CSS类
   */
  getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  },

  /**
   * 获取推荐等级对应的CSS类
   */
  getRecommendationClass(recommendation) {
    const map = {
      '强烈推荐': 'recommendation-strong',
      '推荐': 'recommendation-good',
      '考虑': 'recommendation-consider',
      '不推荐': 'recommendation-not'
    };
    return map[recommendation] || 'recommendation-consider';
  },

  /**
   * 获取情感分析标签
   */
  getSentimentInfo(sentiment) {
    const map = {
      '正面': { class: 'sentiment-positive', bg: 'bg-sentiment-positive', icon: '😊' },
      'positive': { class: 'sentiment-positive', bg: 'bg-sentiment-positive', icon: '😊' },
      '中性': { class: 'sentiment-neutral', bg: 'bg-sentiment-neutral', icon: '😐' },
      'neutral': { class: 'sentiment-neutral', bg: 'bg-sentiment-neutral', icon: '😐' },
      '负面': { class: 'sentiment-negative', bg: 'bg-sentiment-negative', icon: '😞' },
      'negative': { class: 'sentiment-negative', bg: 'bg-sentiment-negative', icon: '😞' }
    };
    return map[sentiment] || { class: '', bg: '', icon: '' };
  },

  /**
   * 生成随机ID
   */
  generateId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * 截取字符串
   */
  truncate(str, maxLength = 100, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + suffix;
  },

  /**
   * 防抖函数
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 节流函数
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 下载文件
   */
  downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * 下载CSV文件
   */
  downloadCSV(data, headers, filename = 'export.csv') {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
  },

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const d = new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 尝试解析JSON
   */
  tryParseJSON(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  },

  /**
   * 获取屏幕尺寸
   */
  getScreenSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  },

  /**
   * 检测是否是移动设备
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
};

// 导出
window.Utils = Utils;
