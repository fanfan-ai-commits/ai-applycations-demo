/**
 * 简历分析应用主逻辑
 */
class ResumeAnalyzerApp {
  constructor() {
    this.state = {
      currentFile: null,
      parsedText: '',
      analysisResult: null,
      history: this.loadHistory()
    };

    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    this.bindEvents();
    this.updateHistoryCount();
    
    // 检查API密钥
    if (!window.aiService.isConfigured()) {
      setTimeout(() => {
        this.showToast('请先配置API密钥', 'warning');
        this.openApiKeyModal();
      }, 500);
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('resumeInput');

    // 点击上传
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFile(e.target.files[0]);
      }
    });

    // 拖拽上传
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  /**
   * 处理文件
   */
  async handleFile(file) {
    // 验证文件类型
    const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(ext)) {
      this.showToast('不支持的文件格式，请上传PDF、Word或TXT文件', 'error');
      return;
    }

    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('文件大小不能超过10MB', 'error');
      return;
    }

    this.state.currentFile = file;
    
    // 显示已选择文件
    document.getElementById('selectedFile').classList.remove('hidden');
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileInfo').textContent = `${this.formatFileSize(file.size)} • 准备分析`;
    document.getElementById('uploadZone').classList.add('hidden');

    this.showToast('文件已选择，点击"开始分析"进行分析', 'info');

    // 自动开始解析
    await this.parseAndAnalyze();
  }

  /**
   * 解析并分析简历
   */
  async parseAndAnalyze() {
    if (!this.state.currentFile) {
      this.showToast('请先选择简历文件', 'warning');
      return;
    }

    if (!window.aiService.isConfigured()) {
      this.openApiKeyModal();
      return;
    }

    // 显示加载状态
    document.getElementById('uploadZone').classList.add('hidden');
    document.getElementById('selectedFile').classList.add('hidden');
    document.getElementById('analysisProgress').classList.remove('hidden');
    document.getElementById('analysisResult').classList.add('hidden');

    try {
      // 1. 解析文件
      document.getElementById('progressText').textContent = '正在解析简历文件...';
      this.state.parsedText = await window.fileParser.parse(this.state.currentFile);

      // 2. 调用AI分析
      document.getElementById('progressText').textContent = '正在AI深度分析...';
      const result = await window.aiService.analyzeResume(this.state.parsedText);
      
      this.state.analysisResult = result;

      // 3. 保存到历史记录
      this.saveToHistory(result);

      // 4. 渲染结果
      this.renderResult(result);

      // 5. 显示结果
      document.getElementById('analysisProgress').classList.add('hidden');
      document.getElementById('analysisResult').classList.remove('hidden');

      // 6. 更新文件信息
      document.getElementById('fileName').textContent = this.state.currentFile.name;
      document.getElementById('fileInfo').textContent = `${this.formatFileSize(this.state.currentFile.size)} • 分析完成`;
      
      this.showToast('分析完成！', 'success');

    } catch (error) {
      console.error('分析错误:', error);
      this.showToast(error.message || '分析失败，请重试', 'error');
      
      // 恢复选择状态
      document.getElementById('uploadZone').classList.remove('hidden');
      document.getElementById('selectedFile').classList.remove('hidden');
      document.getElementById('analysisProgress').classList.add('hidden');
    }
  }

  /**
   * 渲染分析结果
   */
  renderResult(result) {
    const scores = result.scores || {};
    const basicInfo = result.basicInfo || {};
    const salary = result.salary || {};
    const completeness = result.completeness || {};
    const skillTags = result.skillTags || {};

      // 基本信息
      document.getElementById('candidateName').textContent = '张三';
    document.getElementById('candidateTitle').textContent = basicInfo.title || basicInfo.education || '--';

    // 推荐标签
    const badge = document.getElementById('recommendationBadge');
    const recClass = this.getRecommendationClass(result.recommendation);
    badge.textContent = result.recommendation || '--';
    badge.className = `mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${recClass}`;

    // 分数动画
    this.animateScore('overallScore', 'scoreCircle', scores.overall || 0);

    // 维度分数
    this.animateScore('skillsScore', 'skillsBar', scores.skills || 0);
    this.animateScore('experienceScore', 'experienceBar', scores.experience || 0);
    this.animateScore('educationScore', 'educationBar', scores.education || 0);
    this.animateScore('projectScore', 'projectBar', scores.projects || 0);

    // 简历完整度
    this.renderCompleteness(completeness);

    // 薪资参考
    document.getElementById('salaryRange').textContent = salary.min && salary.max 
      ? `¥${salary.min / 1000}k - ${salary.max / 1000}k` 
      : '--';
    document.getElementById('experienceYears').textContent = basicInfo.experienceYears 
      ? `${basicInfo.experienceYears}年` 
      : '--';
    document.getElementById('skillLevel').textContent = salary.level || '--';

    // 优势列表
    this.renderList('strengthsList', result.strengths || []);

    // 优化建议
    this.renderList('improvementsList', result.improvements || []);

    // 面试问题
    this.renderInterviewQuestions(result.interviewQuestions || []);

    // 技能标签
    this.renderSkillTags(skillTags);

    // AI总结
    document.getElementById('aiSummary').textContent = result.summary || '--';
  }

  /**
   * 分数动画（支持圆环和线性进度条）
   */
  animateScore(scoreId, elementId, score) {
    const scoreEl = document.getElementById(scoreId);
    const elementEl = document.getElementById(elementId);
    
    // 数字动画
    let current = 0;
    const duration = 800;
    const steps = 40;
    const increment = score / steps;
    const stepTime = duration / steps;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      scoreEl.textContent = Math.round(current);
    }, stepTime);

    // 动画延迟后开始
    setTimeout(() => {
      if (!elementEl) return;
      
      // 判断是圆环还是线性进度条
      if (elementEl.tagName === 'circle') {
        // 圆环动画
        const circumference = 2 * Math.PI * 48;
        const offset = circumference - (score / 100) * circumference;
        elementEl.style.strokeDashoffset = offset;
      } else {
        // 线性进度条动画
        elementEl.style.width = `${score}%`;
      }
    }, 150);
  }

  /**
   * 渲染简历完整度
   */
  renderCompleteness(completeness) {
    const items = [
      { key: 'personalInfo', label: '个人信息', icon: '👤' },
      { key: 'education', label: '教育背景', icon: '🎓' },
      { key: 'workExperience', label: '工作经历', icon: '💼' },
      { key: 'projects', label: '项目经验', icon: '📁' },
      { key: 'skills', label: '技能特长', icon: '🛠️' },
      { key: 'selfEvaluation', label: '自我评价', icon: '💭' },
      { key: 'certificates', label: '证书资质', icon: '📜' }
    ];

    const container = document.getElementById('completenessList');
    let filledCount = 0;

    container.innerHTML = items.map(item => {
      const present = completeness[item.key];
      if (present) filledCount++;
      
      return `
        <div class="completeness-item">
          <div class="flex items-center space-x-3">
            <span class="text-lg">${item.icon}</span>
            <span class="text-sm text-gray-700">${item.label}</span>
          </div>
          <span class="icon ${present ? 'present' : 'missing'}">
            ${present ? '✓' : '✕'}
          </span>
        </div>
      `;
    }).join('');

    const score = Math.round((filledCount / items.length) * 100);
    document.getElementById('completenessScore').textContent = `${score}%`;
  }

  /**
   * 渲染列表
   */
  renderList(containerId, items) {
    const container = document.getElementById(containerId);
    if (items.length === 0) {
      container.innerHTML = '<li class="text-gray-400 text-sm">暂无信息</li>';
      return;
    }
    
    container.innerHTML = items.map(item => `
      <li class="text-gray-700 text-sm">${item}</li>
    `).join('');
  }

  /**
   * 渲染面试问题
   */
  renderInterviewQuestions(questions) {
    const container = document.getElementById('interviewQuestions');
    
    if (questions.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-sm col-span-2">暂无面试问题推荐</p>';
      return;
    }

    container.innerHTML = questions.map((q, index) => `
      <div class="interview-question" onclick="app.copyQuestion('${this.escapeHtml(q.question)}')">
        <div class="question-text">${index + 1}. ${q.question}</div>
        <span class="question-category">${q.category}</span>
      </div>
    `).join('');
  }

  /**
   * 渲染技能标签
   */
  renderSkillTags(tags) {
    const container = document.getElementById('skillTags');
    
    const primary = tags.primary || [];
    const secondary = tags.secondary || [];
    
    if (primary.length === 0 && secondary.length === 0) {
      container.innerHTML = '<span class="text-gray-400 text-sm">暂无技能信息</span>';
      return;
    }

    const html = primary.map(skill => `
      <span class="skill-tag">${skill}</span>
    `).join('') + secondary.map(skill => `
      <span class="skill-tag secondary">${skill}</span>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * 复制面试问题
   */
  copyQuestion(question) {
    navigator.clipboard.writeText(question).then(() => {
      this.showToast('已复制到剪贴板', 'success');
    }).catch(() => {
      this.showToast('复制失败', 'error');
    });
  }

  /**
   * 获取推荐等级CSS类
   */
  getRecommendationClass(recommendation) {
    const map = {
      '强烈推荐': 'recommendation-strong',
      '推荐': 'recommendation-good',
      '考虑': 'recommendation-consider',
      '不推荐': 'recommendation-not'
    };
    return map[recommendation] || 'recommendation-consider';
  }

  /**
   * 清空文件（重新上传）
   */
  resetUpload() {
    this.state.currentFile = null;
    this.state.parsedText = '';
    this.state.analysisResult = null;
    
    document.getElementById('resumeInput').value = '';
    document.getElementById('selectedFile').classList.add('hidden');
    document.getElementById('uploadZone').classList.remove('hidden');
    document.getElementById('analysisResult').classList.add('hidden');
    document.getElementById('analysisProgress').classList.add('hidden');
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    this.showToast('可以上传新的简历了', 'info');
  }

  /**
   * 兼容旧方法名
   */
  clearFile() {
    this.resetUpload();
  }

  /**
   * 导出报告
   */
  exportReport() {
    if (!this.state.analysisResult) {
      this.showToast('暂无分析结果', 'warning');
      return;
    }

    const result = this.state.analysisResult;
    const timestamp = new Date().toLocaleString('zh-CN');

    const report = `# 简历分析报告
生成时间: ${timestamp}
文件名: 张三

## 基本信息
- 姓名: 张三
- 目标职位: ${result.basicInfo?.title || '--'}
- 工作年限: ${result.basicInfo?.experienceYears || '--'}年
- 学历: ${result.basicInfo?.education || '--'}

## 综合评分: ${result.scores?.overall || '--'}分
- 技能匹配: ${result.scores?.skills || '--'}分
- 经验相关: ${result.scores?.experience || '--'}分
- 教育背景: ${result.scores?.education || '--'}分
- 项目经历: ${result.scores?.projects || '--'}分

## 推荐等级: ${result.recommendation || '--'}

## 薪资参考
${result.salary?.level || '--'}：¥${(result.salary?.min || 0) / 1000}k - ¥${(result.salary?.max || 0) / 1000}k/月

## 候选人优势
${(result.strengths || []).map(s => `- ${s}`).join('\n')}

## 优化建议
${(result.improvements || []).map(s => `- ${s}`).join('\n')}

## 面试问题推荐
${(result.interviewQuestions || []).map((q, i) => `${i + 1}. ${q.question}（${q.category}）`).join('\n')}

## 技能标签
核心技能: ${(result.skillTags?.primary || []).join(', ')}
次要技能: ${(result.skillTags?.secondary || []).join(', ')}

## AI综合评价
${result.summary || '--'}

---
Powered by AI Resume Analyzer
`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `简历分析报告_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('报告已导出', 'success');
  }

  /**
   * 历史记录管理
   */
  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('resumeAnalysisHistory') || '[]');
    } catch {
      return [];
    }
  }

  saveHistory(history) {
    localStorage.setItem('resumeAnalysisHistory', JSON.stringify(history));
    this.state.history = history;
    this.updateHistoryCount();
  }

  saveToHistory(result) {
    const history = this.state.history;
    const item = {
      id: Date.now(),
      fileName: '张三',
      name: '张三',
      score: result.scores?.overall || 0,
      recommendation: result.recommendation || '--',
      title: result.basicInfo?.title || '--',
      time: new Date().toLocaleString('zh-CN')
    };
    
    history.unshift(item);
    
    // 只保留最近50条
    if (history.length > 50) {
      history.pop();
    }
    
    this.saveHistory(history);
    this.renderHistoryList();
  }

  updateHistoryCount() {
    const count = this.state.history.length;
    document.getElementById('historyCount').textContent = count;
  }

  renderHistoryList() {
    const container = document.getElementById('historyList');
    
    if (this.state.history.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-500 py-8">暂无历史记录</div>';
      return;
    }

    container.innerHTML = this.state.history.map(item => `
      <div class="history-item" onclick="app.loadFromHistory(${item.id})">
        <div class="name">${item.name}</div>
        <div class="meta">
          <span>${item.title}</span>
          <span class="score">${item.score}分</span>
        </div>
        <div class="meta mt-1">
          <span>${item.fileName}</span>
          <span>${item.time}</span>
        </div>
      </div>
    `).join('');
  }

  loadFromHistory(id) {
    const item = this.state.history.find(h => h.id === id);
    if (!item) return;

    // TODO: 可以扩展为加载完整历史数据
    this.showToast('点击"开始分析"分析新简历', 'info');
    this.toggleHistoryPanel();
  }

  clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
      this.saveHistory([]);
      this.renderHistoryList();
      this.showToast('历史记录已清空', 'success');
    }
  }

  /**
   * 历史记录面板
   */
  toggleHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    const overlay = document.getElementById('historyOverlay');
    
    if (panel.classList.contains('translate-x-full')) {
      panel.classList.remove('translate-x-full');
      overlay.classList.remove('hidden');
      this.renderHistoryList();
    } else {
      panel.classList.add('translate-x-full');
      overlay.classList.add('hidden');
    }
  }

  /**
   * API密钥管理
   */
  openApiKeyModal() {
    const savedKey = localStorage.getItem('qwen_api_key') || '';
    document.getElementById('apiKeyInput').value = savedKey;
    document.getElementById('apiKeyModal').classList.remove('hidden');
    document.getElementById('apiKeyModal').classList.add('flex');
  }

  closeApiKeyModal() {
    document.getElementById('apiKeyModal').classList.add('hidden');
    document.getElementById('apiKeyModal').classList.remove('flex');
  }

  saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    
    if (!key) {
      this.showToast('请输入API密钥', 'warning');
      return;
    }
    
    if (!key.startsWith('sk-')) {
      this.showToast('API密钥格式不正确', 'error');
      return;
    }
    
    window.aiService.setApiKey(key);
    this.closeApiKeyModal();
    this.showToast('API密钥已保存', 'success');
  }

  /**
   * Toast通知
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const content = document.getElementById('toastContent');
    
    const types = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    content.className = `px-6 py-3 rounded-xl shadow-lg text-white ${types[type] || types.info}`;
    content.textContent = message;
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }

  /**
   * 工具函数
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 全局函数绑定
window.app = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ResumeAnalyzerApp();
});

// 全局暴露函数
window.resetUpload = () => app?.resetUpload();
window.clearFile = () => app?.clearFile();
window.exportReport = (format) => app?.exportReport(format);
window.toggleHistoryPanel = () => app?.toggleHistoryPanel();
window.clearHistory = () => app?.clearHistory();
window.openApiKeyModal = () => app?.openApiKeyModal();
window.closeApiKeyModal = () => app?.closeApiKeyModal();
window.saveApiKey = () => app?.saveApiKey();
window.loadFromHistory = (id) => app?.loadFromHistory(id);
