// ==================== API 配置 ====================
const API_CONFIG = {
  apiKey: 'sk-xxx',
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  model: 'qwen3-max',
  timeout: 30000  // 30秒超时
};

// ==================== 游戏状态 ====================
const state = {
  currentPage: 'welcome',
  showRules: false,
  showThinking: false,
  aiThinkingText: '',
  showRoundResult: false,
  showFinalResult: false,
  currentRound: 1,
  currentTurnIndex: 0,
  playerGuess: 50,
  playerRank: 0,
  gamePlayers: [],
  roundPlayers: [],
  rankedPlayers: [],
  totalScores: {},
  // AI 思考记录：存储每轮的思考内容
  roundThinkingRecords: [],
  currentRoundThinking: []
};

// ==================== 玩家数据 ====================
const players = [
  { id: 'ai-newbie-1', name: 'AI-新手甲', emoji: '😐', level: '新手', levelColor: 'bg-green-100 text-green-700', bgColor: 'bg-green-50', description: '随机猜测，缺乏策略的新手玩家' },
  { id: 'ai-newbie-2', name: 'AI-新手乙', emoji: '🤔', level: '新手', levelColor: 'bg-green-100 text-green-700', bgColor: 'bg-green-50', description: '偶尔会有小聪明的新手玩家' },
  // { id: 'player', name: '你', emoji: '😎', level: '玩家', levelColor: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50', description: '智慧与策略并重的人类玩家', isPlayer: true },
  { id: 'ai-expert-1', name: 'AI-高手甲', emoji: '😏', level: '高手', levelColor: 'bg-orange-100 text-orange-700', bgColor: 'bg-orange-50', description: '精于计算，善于利用对手心理' },
  { id: 'ai-expert-2', name: 'AI-高手乙', emoji: '🤓', level: '高手', levelColor: 'bg-orange-100 text-orange-700', bgColor: 'bg-orange-50', description: '策略多变，让对手难以预测' },
  { id: 'ai-master', name: 'AI-大师', emoji: '🧐', level: '大师', levelColor: 'bg-purple-100 text-purple-700', bgColor: 'bg-purple-50', description: '顶级AI，融合多种高级策略' },
  { id: 'player', name: '你', emoji: '😎', level: '玩家', levelColor: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50', description: '智慧与策略并重的人类玩家', isPlayer: true },
];

// ==================== DOM 元素缓存 ====================
const elements = {
  welcomePage: null,
  gamePage: null,
  backBtn: null,
  startGameBtn: null,
  playersContainer: null,
  currentRound: null,
  currentPlayerName: null,
  toggleRulesBtn: null,
  rulesPanel: null,
  gamePlayersContainer: null,
  aiThinking: null,
  thinkingPlayerName: null,
  aiThinkingText: null,
  aiThinkingContent: null,
  playerInputArea: null,
  guessDisplay: null,
  submitGuessBtn: null,
  roundResult: null,
  roundResultTitle: null,
  roundGuesses: null,
  targetValue: null,
  distanceValue: null,
  playerScore: null,
  roundRanking: null,
  nextRoundBtn: null,
  finalResultModal: null,
  finalResultIcon: null,
  finalResultTitle: null,
  finalResultSubtitle: null,
  finalRanking: null,
  goHomeBtn: null,
  restartBtn: null,
  aiThinkingRecords: null,
  continueSection: null,
  totalScoreSection: null,
  totalScoreRanking: null,
  showFinalResultBtn: null
};

// ==================== 工具函数 ====================
function $(id) {
  return document.getElementById(id);
}

function show(element) {
  if (element) element.classList.remove('hidden');
}

function hide(element) {
  if (element) element.classList.add('hidden');
}

function addClass(element, className) {
  if (element) element.classList.add(className);
}

function removeClass(element, className) {
  if (element) element.classList.remove(className);
}

function isValidGuess(guess) {
  return guess >= 0 && guess <= 100 && Number.isInteger(guess);
}

// ==================== 初始化 DOM 元素引用 ====================
function initElements() {
  elements.welcomePage = $('welcome-page');
  elements.gamePage = $('game-page');
  elements.backBtn = $('back-btn');
  elements.startGameBtn = $('start-game-btn');
  elements.playersContainer = $('players-container');
  elements.currentRound = $('current-round');
  elements.currentPlayerName = $('current-player-name');
  elements.toggleRulesBtn = $('toggle-rules-btn');
  elements.rulesPanel = $('rules-panel');
  elements.gamePlayersContainer = $('game-players-container');
  elements.aiThinking = $('ai-thinking');
  elements.thinkingPlayerName = $('thinking-player-name');
  elements.aiThinkingText = $('ai-thinking-text');
  elements.aiThinkingContent = $('ai-thinking-content');
  elements.playerInputArea = $('player-input-area');
  elements.guessDisplay = $('guess-display');
  elements.submitGuessBtn = $('submit-guess-btn');
  elements.roundResult = $('round-result');
  elements.roundResultTitle = $('round-result-title');
  elements.roundGuesses = $('round-guesses');
  elements.targetValue = $('target-value');
  elements.distanceValue = $('distance-value');
  elements.playerScore = $('player-score');
  elements.roundRanking = $('round-ranking');
  elements.nextRoundBtn = $('next-round-btn');
  elements.finalResultModal = $('final-result-modal');
  elements.finalResultIcon = $('final-result-icon');
  elements.finalResultTitle = $('final-result-title');
  elements.finalResultSubtitle = $('final-result-subtitle');
  elements.finalRanking = $('final-ranking');
  elements.goHomeBtn = $('go-home-btn');
  elements.restartBtn = $('restart-btn');
  elements.aiThinkingRecords = $('ai-thinking-records');
  elements.continueSection = $('continue-section');
  elements.totalScoreSection = $('total-score-section');
  elements.totalScoreRanking = $('total-score-ranking');
  elements.showFinalResultBtn = $('show-final-result-btn');
}

// ==================== 渲染函数 ====================
function renderPlayers() {
  if (!elements.playersContainer) return;

  elements.playersContainer.innerHTML = players.map(player => `
    <div class="bg-white rounded-lg shadow-lg border border-gray-100 p-3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div class="flex items-center mb-2">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-2 ${player.bgColor}">
          <span class="text-xl">${player.emoji}</span>
        </div>
        <div>
          <h4 class="font-bold text-gray-800 text-sm">${player.name}</h4>
          <span class="text-xs px-2 py-0.5 rounded-full ${player.levelColor}">${player.level}</span>
        </div>
      </div>
      <p class="text-xs text-gray-600">${player.description}</p>
    </div>
  `).join('');
}

function renderGamePlayers() {
  if (!elements.gamePlayersContainer) return;

  elements.gamePlayersContainer.innerHTML = state.gamePlayers.map((player, index) => {
    const isCurrentTurn = index === state.currentTurnIndex;
    const hasGuessed = player.hasGuessed;

    let statusHtml = '';
    if (hasGuessed) {
      statusHtml = `<span class="text-base font-bold text-green-600">${player.guess}</span>`;
    } else if (isCurrentTurn) {
      statusHtml = `<span class="text-xs text-blue-600 font-medium animate-pulse">猜测中...</span>`;
    } else {
      statusHtml = `<span class="text-gray-400 text-xs">等待</span>`;
    }

    const borderClass = isCurrentTurn ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20' : 'border-gray-100 bg-gray-50';
    const opacityClass = hasGuessed ? 'opacity-100' : 'opacity-60';

    return `
      <div class="relative p-3 rounded-lg border-2 transition-all duration-300 ${borderClass} ${opacityClass}">
        <div class="text-center">
          <div class="w-10 h-10 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-xl ${player.bgColor}">
            ${player.emoji}
          </div>
          <p class="text-xs font-medium text-gray-600 truncate">${player.name}</p>
          <div class="mt-1.5">
            ${statusHtml}
          </div>
        </div>
        ${isCurrentTurn ? `
          <div class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">${index + 1}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderRoundGuesses() {
  if (!elements.roundGuesses) return;

  elements.roundGuesses.innerHTML = state.roundPlayers.map(player => `
    <div class="flex items-center justify-between p-1.5 rounded bg-gray-50">
      <div class="flex items-center space-x-1.5">
        <span class="text-base">${player.emoji}</span>
        <span class="font-medium text-gray-600 text-xs">${player.name}</span>
      </div>
      <span class="text-base font-bold ${player.isPlayer ? 'text-blue-600' : 'text-gray-600'}">
        ${player.guess}
      </span>
    </div>
  `).join('');
}

function renderRoundRanking() {
  if (!elements.roundRanking) return;

  const rankClasses = [
    'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200',
    'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200',
    'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200',
    'bg-gray-50 border border-gray-100'
  ];

  const badgeClasses = [
    'bg-yellow-400 text-white',
    'bg-gray-400 text-white',
    'bg-orange-400 text-white',
    'bg-gray-300 text-gray-600'
  ];

  elements.roundRanking.innerHTML = state.rankedPlayers.map((player, index) => `
    <div style="height: 36px;margin-top: 6px;" class="flex items-center justify-between p-1.5 rounded-lg transition-all duration-300 ${rankClasses[index] || rankClasses[3]}">
      <div class="flex items-center space-x-1.5">
        <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${badgeClasses[index] || badgeClasses[3]}">
          ${index + 1}
        </span>
        <span class="text-sm">${player.emoji}</span>
        <span class="font-medium ${player.isPlayer ? 'text-blue-600' : 'text-gray-600'} text-xs">
          ${player.name}
        </span>
        ${index === 0 ? '<span class="text-yellow-500 text-xs">👑</span>' : ''}
      </div>
      <div class="flex items-center space-x-1.5">
        <span class="text-xs text-gray-500">距${player.distance.toFixed(2)}</span>
        <span class="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-xs">
          +${player.roundScore}
        </span>
      </div>
    </div>
  `).join('');
}

// 渲染总分排名（第3轮时显示）
function renderTotalScoreRanking() {
  if (!elements.totalScoreRanking) return;

  const sortedPlayers = Object.entries(state.totalScores)
    .map(([id, score]) => {
      const player = players.find(p => p.id === id);
      return {
        ...player,
        totalScore: score,
        isPlayer: player?.isPlayer || false
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const badgeClasses = (index, isPlayer) => {
    if (isPlayer) return 'bg-blue-500 text-white';
    if (index === 0) return 'bg-yellow-400 text-white';
    if (index === 1) return 'bg-gray-400 text-white';
    if (index === 2) return 'bg-orange-400 text-white';
    return 'bg-gray-300 text-gray-600';
  };

  const rowClasses = (index, isPlayer) => {
    if (isPlayer) return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300';
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300';
    return 'bg-white border border-gray-200';
  };

  elements.totalScoreRanking.innerHTML = sortedPlayers.map((player, index) => `
    <div class="flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${rowClasses(index, player.isPlayer)}">
      <div class="flex items-center space-x-2">
        <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${badgeClasses(index, player.isPlayer)}">
          ${index + 1}
        </span>
        <span class="text-lg">${player.emoji}</span>
        <span class="font-bold ${player.isPlayer ? 'text-blue-600' : 'text-gray-700'} text-xs">
          ${player.name}
        </span>
        ${player.isPlayer ? '<span class="text-blue-500 text-xs">(你)</span>' : ''}
      </div>
      <div class="text-right">
        <span class="text-base font-bold text-gray-800">${player.totalScore}</span>
        <span class="text-gray-500 text-xs ml-1">分</span>
      </div>
    </div>
  `).join('');
}

function renderFinalRanking() {
  if (!elements.finalRanking) return;

  const sortedPlayers = Object.entries(state.totalScores)
    .map(([id, score]) => {
      const player = players.find(p => p.id === id);
      return {
        ...player,
        totalScore: score,
        isPlayer: player?.isPlayer || false
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const badgeClasses = (index, isPlayer) => {
    if (isPlayer) return 'bg-blue-500 text-white';
    if (index === 0) return 'bg-yellow-400 text-white';
    if (index === 1) return 'bg-gray-400 text-white';
    if (index === 2) return 'bg-orange-400 text-white';
    return 'bg-gray-300 text-gray-600';
  };

  const rowClasses = (index, isPlayer) => {
    if (isPlayer) return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300';
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300';
    return 'bg-white border border-gray-200';
  };

  elements.finalRanking.innerHTML = sortedPlayers.map((player, index) => `
    <div class="flex items-center justify-between p-2.5 rounded-lg transition-all duration-300 ${rowClasses(index, player.isPlayer)}">
      <div class="flex items-center space-x-2">
        <span class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${badgeClasses(index, player.isPlayer)}">
          ${index + 1}
        </span>
        <span class="text-xl">${player.emoji}</span>
        <span class="font-bold ${player.isPlayer ? 'text-blue-600' : 'text-gray-700'} text-sm">
          ${player.name}
        </span>
        ${player.isPlayer ? '<span class="text-blue-500 text-xs">(你)</span>' : ''}
      </div>
      <div class="text-right">
        <span class="text-lg font-bold text-gray-800">${player.totalScore}</span>
        <span class="text-gray-500 text-xs ml-1">分</span>
      </div>
    </div>
  `).join('');
}

// 渲染 AI 思考记录
function renderAIThinkingRecords() {
  if (!elements.aiThinkingRecords) return;

  // 只显示 AI 玩家的思考记录（排除真人玩家）
  const aiRecords = state.currentRoundThinking.filter(r => !r.playerId.includes('player'));

  if (aiRecords.length === 0) {
    elements.aiThinkingRecords.innerHTML = '<p class="text-gray-500 text-xs">暂无 AI 思考记录</p>';
    return;
  }

  elements.aiThinkingRecords.innerHTML = aiRecords.map((record, index) => `
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden transition-all duration-300">
      <!-- 头部：玩家信息和猜测结果 -->
      <div
        class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
        onclick="toggleThinkingRecord('${record.playerId}')"
      >
        <div class="flex items-center space-x-2">
          <span class="text-lg">${record.emoji}</span>
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="font-medium text-gray-800 text-xs">${record.playerName}</span>
              <span class="text-xs px-1.5 py-0.5 rounded-full ${record.levelColor}">${record.level}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-lg font-bold text-blue-600">${record.guess}</span>
          <svg id="icon-${record.playerId}" class="w-4 h-4 text-gray-400 transition-transform duration-300 ${record.isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
      <!-- 思考内容：可展开/折叠 -->
      <div id="content-${record.playerId}" style="overflow: auto;" class="transition-all duration-300 ease-in-out ${record.isExpanded ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="px-3 pb-3">
          <div class="bg-white/80 rounded p-2 border border-gray-200">
            <p class="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">${record.thinking}</p>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// 切换思考记录展开/折叠
function toggleThinkingRecord(playerId) {
  const record = state.currentRoundThinking.find(r => r.playerId === playerId);
  if (record) {
    record.isExpanded = !record.isExpanded;
    renderAIThinkingRecords();
  }
}

// 全局暴露函数供 HTML 调用
window.toggleThinkingRecord = toggleThinkingRecord;

function updateCurrentPlayerDisplay() {
  if (elements.currentPlayerName && state.gamePlayers[state.currentTurnIndex]) {
    const player = state.gamePlayers[state.currentTurnIndex];
    elements.currentPlayerName.textContent = player.name;

    if (player.isPlayer) {
      removeClass(elements.currentPlayerName, 'text-gray-400');
      addClass(elements.currentPlayerName, 'text-blue-600');
    } else {
      removeClass(elements.currentPlayerName, 'text-blue-600');
      addClass(elements.currentPlayerName, 'text-gray-400');
    }
  }
}

// ==================== 页面切换 ====================
function goToWelcome() {
  state.currentPage = 'welcome';
  show(elements.welcomePage);
  hide(elements.gamePage);
  hide(elements.backBtn);
  resetGame();
}

function goToGame() {
  state.currentPage = 'game';
  hide(elements.welcomePage);
  show(elements.gamePage);
  show(elements.backBtn);
}

// ==================== 游戏逻辑 ====================
function startGame() {
  resetGame();
  goToGame();
  initGamePlayers();
  startRound();
}

function resetGame() {
  state.currentRound = 1;
  state.currentTurnIndex = 0;
  state.playerGuess = 50;
  state.showRules = false;
  state.showThinking = false;
  state.aiThinkingText = '';
  state.showRoundResult = false;
  state.showFinalResult = false;
  state.roundPlayers = [];
  state.rankedPlayers = [];
  state.totalScores = {};
  state.roundThinkingRecords = [];
  state.currentRoundThinking = [];

  if (elements.currentRound) elements.currentRound.textContent = '1';
  hide(elements.rulesPanel);
  hide(elements.aiThinking);
  hide(elements.playerInputArea);
  hide(elements.roundResult);
  hide(elements.finalResultModal);
  hide(elements.totalScoreSection);
  show(elements.continueSection);

  // 重置玩家猜测
  state.playerGuess = 50;
  updateGuessDisplay();
}

function initGamePlayers() {
  state.gamePlayers = players.map(p => ({
    ...p,
    guess: null,
    hasGuessed: false,
    roundScore: 0,
    distance: 0
  }));

  players.forEach(p => {
    state.totalScores[p.id] = 0;
  });
}

async function startRound() {
  state.showRoundResult = false;
  state.showFinalResult = false;
  state.currentRoundThinking = []; // 清空当前轮的思考记录

  state.gamePlayers.forEach(p => {
    p.guess = null;
    p.hasGuessed = false;
    p.roundScore = 0;
    p.distance = 0;
  });

  // 重置后立即渲染，清除上一轮的数字显示
  renderGamePlayers();

  state.currentTurnIndex = 0;
  state.playerGuess = 50;

  if (elements.currentRound) elements.currentRound.textContent = state.currentRound;
  updateGuessDisplay();
  updateCurrentPlayerDisplay(); // 更新当前玩家显示

  await processTurn();
}

async function processTurn() {
  if (state.currentTurnIndex >= state.gamePlayers.length) {
    calculateRoundResults();
    return;
  }

  const currentPlayer = state.gamePlayers[state.currentTurnIndex];

  if (currentPlayer.isPlayer) {
    state.showThinking = false;
    state.aiThinkingText = '';
    show(elements.playerInputArea);
    renderGamePlayers();
    updateCurrentPlayerDisplay();
  } else {
    hide(elements.playerInputArea);
    updateCurrentPlayerDisplay(); // 更新顶部当前玩家显示
    await processAITurn(currentPlayer);
  }
}

async function processAITurn(aiPlayer) {
  show(elements.aiThinking);
  if (elements.thinkingPlayerName) {
    elements.thinkingPlayerName.textContent = `${aiPlayer.name} 思考中...`;
  }

  // 清空之前的思考内容
  state.aiThinkingText = '';
  if (elements.aiThinkingText) {
    elements.aiThinkingText.textContent = '';
  }

  // 获取已猜测的玩家信息
  const guessedPlayers = state.gamePlayers.filter(p => p.hasGuessed && !p.isPlayer);

  // 构建提示词
  const prompt = buildAIPrompt(aiPlayer, guessedPlayers);

  try {
    // 调用真实 API
    const result = await callAISteamingAPI(prompt);

    // 解析 JSON 提取 action
    const action = parseAIAction(result.thinking);

    // 设置 AI 的猜测
    aiPlayer.guess = action;

    // 存储思考内容（不包含 JSON 部分）
    state.aiThinkingText = result.thinking;

    // 保存到当前轮的思考记录
    state.currentRoundThinking.push({
      playerId: aiPlayer.id,
      playerName: aiPlayer.name,
      emoji: aiPlayer.emoji,
      level: aiPlayer.level,
      levelColor: aiPlayer.levelColor,
      bgColor: aiPlayer.bgColor,
      thinking: result.thinking,
      guess: action,
      isExpanded: false // 默认折叠
    });

  } catch (error) {
    console.error('AI API 调用失败:', error);
    // 降级使用本地策略
    const fallbackResult = generateFallbackThinking(aiPlayer, guessedPlayers);
    state.aiThinkingText = fallbackResult.thinking;
    aiPlayer.guess = fallbackResult.guess;

    // 保存降级策略的思考记录
    state.currentRoundThinking.push({
      playerId: aiPlayer.id,
      playerName: aiPlayer.name,
      emoji: aiPlayer.emoji,
      level: aiPlayer.level,
      levelColor: aiPlayer.levelColor,
      bgColor: aiPlayer.bgColor,
      thinking: fallbackResult.thinking,
      guess: fallbackResult.guess,
      isExpanded: false
    });
  }

  // 显示思考内容
  if (elements.aiThinkingText) {
    elements.aiThinkingText.textContent = state.aiThinkingText;
  }

  // 滚动到底部
  scrollToBottom();

  // 延迟一下让用户阅读思考过程
  await new Promise(resolve => setTimeout(resolve, 800));

  aiPlayer.hasGuessed = true;
  state.showThinking = false;
  hide(elements.aiThinking);

  state.currentTurnIndex++;
  renderGamePlayers();
  await processTurn();
}

// 构建 AI 提示词
function buildAIPrompt(aiPlayer, guessedPlayers) {
  const roundInfo = `当前是第 ${state.currentRound} 轮，当前火柴棒数量：${getTotalGuesses() + 1}根。`;

  let playerInfo = '';
  if (guessedPlayers.length > 0) {
    const guesses = guessedPlayers.map(p => `${p.name}猜测了${p.guess}`).join('，');
    playerInfo = `已猜测的玩家：${guesses}。`;
  } else {
    playerInfo = '目前还没有其他玩家猜测。';
  }

  const rules = `
游戏规则：
1. 取到最后一根火柴棒的人失败
2. 猜测范围：0-100 的整数
3. 当前有 6 位玩家轮流猜测
4. 每轮每人猜测一个数字
5. 目标值 = 所有猜测数的平均值 × 2/3
6. 最接近目标值的玩家获胜
`;

  const playerLevel = aiPlayer.level === '新手' ? '作为新手玩家，策略简单直接' :
                      aiPlayer.level === '高手' ? '作为高手玩家，需要展示策略思考' :
                      '作为大师级玩家，需要展示深度分析和博弈论思维';

  return `你正在玩一个猜数字的博弈游戏。
${roundInfo}
${playerInfo}
${rules}
${playerLevel}。

请按照以下格式输出：
1. 先输出你的分析思考过程（基于游戏规则和当前局势）
2. 然后输出最终决策，必须用以下 JSON 格式：
\`\`\`json
{"action": 数字}
\`\`\`

注意：
- JSON 必须用三个反引号包裹，并在第一行标注 json
- action 必须是 0-100 的整数
- 分析过程要符合你的角色水平

例如：
作为新手，我随机选择一个数字...
\`\`\`json
{"action": 45}
\`\`\``;
}

// 调用 AI 流式 API
async function callAISteamingAPI(prompt) {
  const response = await fetch(API_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let contentBuffer = '';
  let thinkingContent = '';
  let isThinkingPhase = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;

      const dataStr = line.slice(5).trim();
      if (dataStr === '[DONE]') continue;

      try {
        const data = JSON.parse(dataStr);
        const delta = data.choices?.[0]?.delta?.content;

        if (!delta) continue;

        contentBuffer += delta;

        // 检查是否进入 JSON 阶段
        if (isThinkingPhase && contentBuffer.includes('```json')) {
          // 提取思考过程（不包含 JSON 部分）
          const thinkingPart = contentBuffer.split('```json')[0].trim();
          thinkingContent = thinkingPart;

          // 实时更新显示
          if (elements.aiThinkingText) {
            elements.aiThinkingText.textContent = thinkingContent;
            scrollToBottom();
          }
          isThinkingPhase = false;
        } else if (isThinkingPhase) {
          // 仍在思考阶段，实时更新
          if (elements.aiThinkingText) {
            elements.aiThinkingText.textContent = contentBuffer;
            scrollToBottom();
          }
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
  }

  // 提取最终思考内容（去除 JSON 部分）
  // const finalThinking = contentBuffer.split('```json')[0].trim();

  return {
    thinking: contentBuffer,
    fullContent: contentBuffer
  };
}

// 解析 AI 返回的 JSON 获取 action
function parseAIAction(fullContent) {
  // 匹配 ```json ... ``` 包裹的内容
  const jsonBlockMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/);

  if (jsonBlockMatch) {
    try {
      const jsonStr = jsonBlockMatch[1].trim();
      const jsonObj = JSON.parse(jsonStr);

      if (typeof jsonObj.action === 'number' && jsonObj.action >= 0 && jsonObj.action <= 100) {
        return jsonObj.action;
      }
    } catch (e) {
      console.error('JSON 解析失败:', e);
    }
  }

  // 备选方案：直接匹配 action 字段
  const actionMatch = fullContent.match(/["']?action["']?\s*:\s*["']?(\d+)["']?/);
  if (actionMatch) {
    const action = parseInt(actionMatch[1], 10);
    if (action >= 0 && action <= 100) {
      return action;
    }
  }

  // 如果都失败，返回随机值
  return Math.floor(Math.random() * 101);
}

// 滚动到思考内容底部
function scrollToBottom() {
  const contentDiv = document.getElementById('ai-thinking-content');
  if (contentDiv) {
    contentDiv.scrollTop = contentDiv.scrollHeight;
  }
}

// 获取已猜测的总数（用于模拟火柴棒数量）
function getTotalGuesses() {
  return state.gamePlayers.filter(p => p.hasGuessed).length;
}

// 降级策略：本地生成思考和猜测
function generateFallbackThinking(aiPlayer, guessedPlayers) {
  let thinking = '';
  let guess = 0;

  if (aiPlayer.level === '新手') {
    thinking = generateNewbieThinking(guessedPlayers, aiPlayer.id);
    guess = Math.floor(Math.random() * 101);
  } else if (aiPlayer.level === '高手') {
    thinking = generateExpertThinking(guessedPlayers, aiPlayer.id);
    guess = generateExpertGuess(guessedPlayers);
  } else {
    thinking = generateMasterThinking(guessedPlayers, aiPlayer.id);
    guess = generateMasterGuess(guessedPlayers);
  }

  return { thinking, guess };
}

// AI 思考文本生成
function generateNewbieThinking(guessedPlayers, aiId) {
  const thoughts = [
    '让我随便猜一个数字吧...',
    '我觉得50左右应该不错',
    '就选这个吧，看起来挺顺眼的',
    '随机选一个，开心就好',
    '管他呢，随便猜！'
  ];
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

function generateExpertThinking(guessedPlayers, aiId) {
  if (guessedPlayers.length === 0) {
    const thoughts = [
      '根据博弈论，我应该选择一个不太明显的数字...',
      '让我分析一下其他玩家可能的策略...',
      '新手通常会猜50左右，我应该避开这个区间'
    ];
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  }

  const avg = guessedPlayers.reduce((acc, p) => acc + p.guess, 0) / guessedPlayers.length;
  const thoughts = [
    `目前平均猜测是${avg.toFixed(1)}，目标值大约是${(avg * 2/3).toFixed(1)}`,
    `根据前面的猜测，我应该选择一个更靠近目标值的数字`,
    `让我调整一下策略，选择一个更有竞争力的数字`
  ];
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

function generateMasterThinking(guessedPlayers, aiId) {
  if (guessedPlayers.length === 0) {
    return `作为大师级AI，我将采用高级纳什均衡策略。根据历史数据分析，大多数玩家会倾向于猜测50左右的标准值，但真正的最优策略应该是选择0-100范围内更靠前但又不太明显的数字。我将仔细计算每个区间的胜率，选择数学期望最优的答案。`;
  }

  const avg = guessedPlayers.reduce((acc, p) => acc + p.guess, 0) / guessedPlayers.length;
  const target = avg * 2/3;

  return `经过深度分析：
当前平均猜测 ${avg.toFixed(2)} → 目标值 ${target.toFixed(2)}
我将采用逆向博弈策略。其他玩家可能会基于我的行为调整，我需要选择一个他们不太可能选择但又足够接近目标的数字。综合考虑纳什均衡和各玩家历史数据，最优选择是...`;
}

// AI 猜测数字生成
function generateExpertGuess(guessedPlayers) {
  if (guessedPlayers.length === 0) {
    return Math.floor(Math.random() * 40) + 15;
  }

  const avg = guessedPlayers.reduce((acc, p) => acc + p.guess, 0) / guessedPlayers.length;
  const target = avg * 2/3;

  const variation = Math.floor(Math.random() * 10) - 5;
  return Math.max(0, Math.min(100, Math.round(target + variation)));
}

function generateMasterGuess(guessedPlayers) {
  if (guessedPlayers.length === 0) {
    return Math.floor(Math.random() * 33);
  }

  const avg = guessedPlayers.reduce((acc, p) => acc + p.guess, 0) / guessedPlayers.length;
  const target = avg * 2/3;

  const error = Math.floor(Math.random() * 6) - 3;
  return Math.max(0, Math.min(100, Math.round(target + error)));
}

// 玩家提交猜测
function submitPlayerGuess() {
  const guess = state.playerGuess;

  if (!isValidGuess(guess)) return;

  const currentPlayer = state.gamePlayers[state.currentTurnIndex];
  currentPlayer.guess = guess;
  currentPlayer.hasGuessed = true;

  hide(elements.playerInputArea);
  state.currentTurnIndex++;
  renderGamePlayers();
  processTurn();
}

// 计算轮次结果
function calculateRoundResults() {
  state.roundPlayers = state.gamePlayers.map(p => ({ ...p }));

  const sum = state.gamePlayers.reduce((acc, p) => acc + p.guess, 0);
  const avg = sum / state.gamePlayers.length;
  const target = avg * 2/3;

  const playersWithDistance = state.gamePlayers.map(p => ({
    ...p,
    distance: Math.abs(p.guess - target)
  }));

  playersWithDistance.sort((a, b) => a.distance - b.distance);

  playersWithDistance.forEach((player, index) => {
    player.roundScore = 6 - index;
    state.totalScores[player.id] += player.roundScore;
  });

  state.rankedPlayers = playersWithDistance;

  // 保存当前轮的思考记录
  state.roundThinkingRecords.push({
    round: state.currentRound,
    thinking: [...state.currentRoundThinking]
  });

  const playerRankIndex = state.rankedPlayers.findIndex(p => p.isPlayer);
  state.playerRank = playerRankIndex + 1;

  if (elements.roundResultTitle) {
    elements.roundResultTitle.textContent = `第 ${state.currentRound} 轮结果`;
  }

  // 更新目标值
  if (elements.targetValue) {
    elements.targetValue.textContent = target.toFixed(2);
  }

  // 更新玩家距目标和得分
  const playerData = state.rankedPlayers.find(p => p.isPlayer);
  if (playerData) {
    if (elements.distanceValue) {
      elements.distanceValue.textContent = playerData.distance.toFixed(2);
    }
    if (elements.playerScore) {
      elements.playerScore.textContent = `+${playerData.roundScore}`;
    }
  }

  renderRoundGuesses();
  renderRoundRanking();
  renderAIThinkingRecords();
  show(elements.roundResult);

  // 第3轮时隐藏开始下一轮按钮，显示总分排名
  if (state.currentRound >= 3) {
    hide(elements.continueSection);
    show(elements.totalScoreSection);
    renderTotalScoreRanking();
  }
}

// 下一轮
function nextRound() {
  if (state.currentRound >= 3) {
    showFinalResult();
    return;
  }

  state.currentRound++;
  startRound();
}

// 显示最终结果
function showFinalResult() {
  const playerRank = state.playerRank;

  if (elements.finalResultTitle) {
    if (playerRank === 1) {
      elements.finalResultTitle.textContent = '恭喜你获胜！';
    } else if (playerRank <= 3) {
      elements.finalResultTitle.textContent = '不错的表现！';
    } else {
      elements.finalResultTitle.textContent = '继续加油！';
    }
  }

  if (elements.finalResultSubtitle) {
    if (playerRank === 1) {
      elements.finalResultSubtitle.textContent = '你是本场最佳策略大师！';
    } else {
      elements.finalResultSubtitle.textContent = `你在6位玩家中排名第 ${playerRank}`;
    }
  }

  if (elements.finalResultIcon) {
    if (playerRank === 1) {
      removeClass(elements.finalResultIcon, 'from-blue-400 to-indigo-500');
      addClass(elements.finalResultIcon, 'from-yellow-400 to-amber-500');
      elements.finalResultIcon.querySelector('span').textContent = '🏆';
    } else {
      removeClass(elements.finalResultIcon, 'from-yellow-400 to-amber-500');
      addClass(elements.finalResultIcon, 'from-blue-400 to-indigo-500');
      elements.finalResultIcon.querySelector('span').textContent = '🎮';
    }
  }

  renderFinalRanking();
  show(elements.finalResultModal);
}

// 重新开始游戏
function restartGame() {
  hide(elements.finalResultModal);
  resetGame();
  initGamePlayers();
  startRound();
}

// ==================== 事件监听 ====================
function initEventListeners() {
  // 返回首页按钮
  elements.backBtn?.addEventListener('click', goToWelcome);

  // 开始游戏按钮
  elements.startGameBtn?.addEventListener('click', startGame);

  // 切换规则面板
  elements.toggleRulesBtn?.addEventListener('click', () => {
    state.showRules = !state.showRules;
    if (state.showRules) {
      show(elements.rulesPanel);
    } else {
      hide(elements.rulesPanel);
    }
  });

  // 提交猜测按钮
  elements.submitGuessBtn?.addEventListener('click', submitPlayerGuess);

  // 下一轮按钮
  elements.nextRoundBtn?.addEventListener('click', nextRound);

  // 查看最终结果按钮（第3轮后显示）
  elements.showFinalResultBtn?.addEventListener('click', showFinalResult);

  // 返回首页按钮（最终结果弹窗）
  elements.goHomeBtn?.addEventListener('click', goToWelcome);

  // 重新开始按钮
  elements.restartBtn?.addEventListener('click', restartGame);

  // 键盘支持
  document.addEventListener('keydown', handleKeyboardInput);

  // 数字键盘事件
  initNumpadListeners();
}

// 初始化数字键盘事件监听
function initNumpadListeners() {
  // 数字键
  document.querySelectorAll('.num-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = parseInt(btn.dataset.digit, 10);
      updateGuess(digit);
    });
  });

  // 退格键
  const backspaceBtn = document.getElementById('btn-backspace');
  if (backspaceBtn) {
    backspaceBtn.addEventListener('click', deleteDigit);
  }

  // 快捷选择按钮
  document.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.quick, 10);
      quickSelect(value);
    });
  });
}

// 处理键盘输入
function handleKeyboardInput(e) {
  if (state.currentPage !== 'game') return;
  if (!elements.playerInputArea || elements.playerInputArea.classList.contains('hidden')) return;

  const key = e.key;

  // 数字键
  if (/^[0-9]$/.test(key)) {
    updateGuess(parseInt(key, 10));
  }
  // 退格键
  else if (key === 'Backspace') {
    deleteDigit();
  }
  // 回车键
  else if (key === 'Enter') {
    submitPlayerGuess();
  }
}

// 更新猜测数字（追加数字）
function updateGuess(digit) {
  const currentValue = state.playerGuess;
  let newValue = currentValue * 10 + digit;

  // 限制在 0-100 之间
  if (newValue > 100) {
    newValue = digit;
  }

  state.playerGuess = newValue;
  updateGuessDisplay();
}

// 快捷选择数字
function quickSelect(value) {
  state.playerGuess = value;
  updateGuessDisplay();
}

// 删除最后一个数字
function deleteDigit() {
  const currentValue = state.playerGuess;
  if (currentValue < 10) {
    state.playerGuess = 0;
  } else {
    state.playerGuess = Math.floor(currentValue / 10);
  }
  updateGuessDisplay();
}

// 更新数字显示
function updateGuessDisplay() {
  if (elements.guessDisplay) {
    elements.guessDisplay.querySelector('span').textContent = state.playerGuess;
  }
}

// ==================== 初始化 ====================
function init() {
  initElements();
  renderPlayers();
  initEventListeners();
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);

