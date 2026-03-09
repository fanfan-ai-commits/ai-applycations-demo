// Configuration
const API_KEY = 'sk-xxx';
const ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const MODEL = 'qwen3-max';

// State
let conversationHistory = [
    {
        role: 'system',
        content: '你是一位幽默、资深的高中化学老师，擅长用生动的例子和简洁的语言解释化学概念。你应该用 Markdown 格式回答问题，并适当使用化学符号（下标如 H₂O）。'
    }
];

// DOM Elements
const periodicTableEl = document.getElementById('periodicTable');
const chatContainerEl = document.getElementById('chatContainer');
const userInputEl = document.getElementById('userInput');
const sendBtnEl = document.getElementById('sendBtn');
const clearChatBtnEl = document.getElementById('clearChatBtn');

// Quiz Elements - will be initialized after DOM loads
let quizBtnEl, quizModal, quizContent, closeQuizBtn;

// Modal Elements
const modal = document.getElementById('elementModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize quiz elements
    quizBtnEl = document.getElementById('quizBtn');
    quizModal = document.getElementById('quizModal');
    quizContent = document.getElementById('quizContent');
    closeQuizBtn = document.getElementById('closeQuiz');
    
    renderPeriodicTable();
    setupEventListeners();
});

// Quiz State
let currentQuiz = null;
let quizScore = { correct: 0, total: 0 };

// Render Periodic Table
function renderPeriodicTable() {
    elements.forEach(element => {
        const tile = document.createElement('div');
        
        // Grid positioning
        let row = element.row;
        let col = element.column;

        tile.style.gridColumn = col;
        tile.style.gridRow = row;

        tile.className = `element-tile element-tile-${element.number} relative flex flex-col items-center justify-center w-full aspect-[3/4] rounded-sm text-xs font-bold cursor-pointer text-slate-900 bg-${element.category} hover:z-10`;
        
        tile.innerHTML = `
            <span class="text-[10px] absolute top-0.5 left-0.5 opacity-70">${element.number}</span>
            <span class="text-base">${element.symbol}</span>
            <span class="text-[8px] truncate w-full text-center opacity-90">${element.name}</span>
        `;
        
        tile.dataset.element = JSON.stringify(element);
        
        tile.addEventListener('click', () => {
            showElementModal(element);
        });

        tile.title = `${element.name} (${element.symbol})\nAtomic Mass: ${element.mass}\nCategory: ${element.category}`;

        periodicTableEl.appendChild(tile);
    });
}

// Event Listeners
function setupEventListeners() {
    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Close on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Chat functionality
    sendBtnEl.addEventListener('click', handleUserMessage);
    
    userInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    clearChatBtnEl.addEventListener('click', () => {
        if(confirm('确定要清空对话记录吗？')) {
            conversationHistory = [
                {
                    role: 'system',
                    content: '你是一位幽默、资深的高中化学老师，擅长用生动的例子和简洁的语言解释化学概念。你应该用 Markdown 格式回答问题，并适当使用化学符号（下标如 H₂O）。'
                }
            ];
            chatContainerEl.innerHTML = '';
            addMessage('assistant', '对话已清空。让我们重新开始吧！');
        }
    });

    // Quiz functionality
    if (quizBtnEl) {
        quizBtnEl.addEventListener('click', startQuiz);
    }
    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', () => {
            quizModal.classList.add('hidden');
        });
    }
    if (quizModal) {
        quizModal.addEventListener('click', (e) => {
            if (e.target === quizModal) {
                quizModal.classList.add('hidden');
            }
        });
    }
}

// Show Element Modal
function showElementModal(element) {
    const modal = document.getElementById('elementModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementById('closeModal');

    if (!modal || !modalContent) {
        alert("Modal elements not found!"); 
        return;
    }

    // Setup close button
    if (closeModal) {
        closeModal.onclick = function() {
            modal.classList.add('hidden');
        }
    }

    const categoryNameMap = {
        "alkali-metal": "碱金属",
        "alkaline-earth": "碱土金属",
        "transition-metal": "过渡金属",
        "post-transition": "贫金属",
        "metalloid": "类金属",
        "nonmetal": "非金属",
        "halogen": "卤素",
        "noble-gas": "稀有气体",
        "lanthanide": "镧系元素",
        "actinide": "锕系元素",
        "unknown": "未知"
    };

    const category = categoryNameMap[element.category] || element.category;

    // Generate modal content
    let html = `
        <div class="flex flex-col md:flex-row gap-6">
            <!-- Left: Element Visual -->
            <div class="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-slate-100 rounded-xl text-slate-900 w-full md:w-1/3 shadow-inner">
                <div class="text-6xl font-bold mb-2 text-slate-800">${element.symbol}</div>
                <div class="text-2xl font-medium text-slate-600 mb-4">${element.name}</div>
                <div class="text-lg text-slate-500">${element.number}</div>
                <div class="text-sm text-slate-400 mt-2">原子质量: ${element.mass}</div>
            </div>

            <!-- Right: Element Details -->
            <div class="flex-1 space-y-4">
                <div>
                    <h3 class="text-teal-400 font-bold text-lg mb-1 border-b border-slate-700 pb-1">基本信息</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="text-slate-400">类别:</div>
                        <div class="text-slate-200 font-medium">${category}</div>
                        
                        <div class="text-slate-400">原子序数:</div>
                        <div class="text-slate-200">${element.number}</div>
                        
                        <div class="text-slate-400">原子质量:</div>
                        <div class="text-slate-200">${element.mass} u</div>
                        
                        <div class="text-slate-400">发现年份:</div>
                        <div class="text-slate-200">${element.discovery_year}</div>
                    </div>
                </div>

                <div>
                    <h3 class="text-teal-400 font-bold text-lg mb-1 border-b border-slate-700 pb-1">电子排布</h3>
                    <div class="bg-slate-800 p-3 rounded font-mono text-center text-yellow-400 tracking-widest">
                        ${element.electron_configuration}
                    </div>
                </div>

                <div class="pt-4 border-t border-slate-700">
                    <p class="text-slate-300 text-sm leading-relaxed">
                        You can ask me questions in the chat below!
                    </p>
                </div>
            </div>
        </div>
    `;

    modalContent.innerHTML = html;
    modal.classList.remove('hidden');
}

// Handle User Message
async function handleUserMessage() {
    const text = userInputEl.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInputEl.value = '';
    conversationHistory.push({ role: 'user', content: text });
    showTypingIndicator();

    try {
        const response = await callAI();
        removeTypingIndicator();
        addMessage('assistant', response);
        conversationHistory.push({ role: 'assistant', content: response });
    } catch (error) {
        removeTypingIndicator();
        console.error(error);
        addMessage('assistant', `抱歉，发生了错误：${error.message}`);
    }
}

// API Call
async function callAI() {
    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: conversationHistory,
            temperature: 0.7,
            stream: false
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'API Request Failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// UI Helpers
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex gap-3 animate-fade-in';
    
    const isUser = role === 'user';
    
    messageDiv.innerHTML = `
        ${!isUser ? `
        <div class="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-robot text-white text-sm"></i>
        </div>` : ''}
        
        <div class="${isUser ? 'ml-auto bg-indigo-600 text-white rounded-lg rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-lg rounded-tl-none'} px-3 max-w-[85%] text-sm py-3">
            ${content}
        </div>

        ${isUser ? `
        <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-user text-white text-sm"></i>
        </div>` : ''}
    `;

    chatContainerEl.appendChild(messageDiv);
    chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'flex gap-3';
    indicator.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-slate-700 p-3 rounded-lg rounded-tl-none flex gap-1 items-center">
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
    `;
    chatContainerEl.appendChild(indicator);
    chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// ==================== Quiz Functions ====================

async function startQuiz() {
    if (!quizModal || !quizContent) {
        console.error('Quiz elements not found');
        return;
    }
    
    quizModal.classList.remove('hidden');
    quizContent.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin text-4xl text-teal-400 mb-4">
                <i class="fa-solid fa-circle-notch"></i>
            </div>
            <p class="text-slate-300">AI 正在生成测验题目...</p>
        </div>
    `;

    try {
        // 生成随机主题索引
        const topics = [
            '原子结构与周期律', '化学键与分子结构', '氧化还原反应', 
            '酸碱盐的性质', '化学反应速率与平衡', '有机化学基础',
            '元素性质递变', '化学实验操作', '物质的量与计算'
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        const prompt = `你是一位高中化学老师。请生成一道关于「${randomTopic}」的随机化学选择题或填空题。
要求：
1. 题目要适合高中生
2. 包含4个选项（如果是选择题）
3. 必须包含正确答案和详细解析
4. 用中文出题

请严格按照以下JSON格式返回，不要有其他内容：
{
    "type": "choice" 或 "blank",
    "question": "题目内容",
    "options": ["选项1", "选项2", "选项3", "选项4"]（选择题需要）,
    "answer": "正确答案",
    "explanation": "详细解析（至少50字，包含化学原理）"
}`;

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: '你是一位专业的高中化学老师，擅长出题和解析。你必须严格按照JSON格式返回，不要有其他内容。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 1.0,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }
        
        currentQuiz = JSON.parse(jsonMatch[0]);
        renderQuiz();
        
    } catch (error) {
        quizContent.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-400 text-4xl mb-4">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <p class="text-slate-300 mb-4">生成题目失败，请重试</p>
                <button onclick="startQuiz()" class="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition-colors">
                    重新开始
                </button>
            </div>
        `;
    }
}

function renderQuiz() {
    if (!currentQuiz) return;

    quizScore.total++;
    
    let optionsHtml = '';
    
    if (currentQuiz.type === 'choice' && currentQuiz.options) {
        optionsHtml = `
            <div class="space-y-3 mt-4">
                ${currentQuiz.options.map((opt, idx) => `
                    <label class="flex items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors">
                        <input type="radio" name="quizAnswer" value="${opt}" class="w-4 h-4 text-teal-500 bg-slate-600 border-slate-500 focus:ring-teal-500">
                        <span class="ml-3 text-slate-200">${String.fromCharCode(65 + idx)}. ${opt}</span>
                    </label>
                `).join('')}
            </div>
        `;
    } else {
        optionsHtml = `
            <div class="mt-4">
                <input type="text" id="quizBlankAnswer" placeholder="请输入你的答案" 
                    class="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-600 placeholder-slate-500">
            </div>
        `;
    }

    quizContent.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-slate-400 mr-auto">智能测验</span>
            </div>
            <div class="bg-slate-700 p-4 rounded-lg mb-4">
                <p class="text-lg text-white font-medium">${currentQuiz.question}</p>
            </div>
            ${optionsHtml}
        </div>
        <div class="flex gap-3">
            <button id="submitQuizBtn" class="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-lg font-medium transition-colors">
                提交答案
            </button>
            <button id="nextQuizBtn" class="hidden flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition-colors">
                下一题
            </button>
        </div>
    `;

    document.getElementById('submitQuizBtn').addEventListener('click', checkAnswer);
}

function checkAnswer() {
    let userAnswer = '';
    
    if (currentQuiz.type === 'choice') {
        const selected = document.querySelector('input[name="quizAnswer"]:checked');
        if (!selected) {
            alert('请选择一个答案');
            return;
        }
        userAnswer = selected.value;
    } else {
        userAnswer = document.getElementById('quizBlankAnswer').value.trim();
        if (!userAnswer) {
            alert('请输入答案');
            return;
        }
    }

    const isCorrect = userAnswer.toLowerCase() === currentQuiz.answer.toLowerCase() || 
                      userAnswer.includes(currentQuiz.answer);
    
    if (isCorrect) {
        quizScore.correct++;
    }

    // Show result
    const resultClass = isCorrect ? 'bg-green-600' : 'bg-red-600';
    const resultIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
    const resultText = isCorrect ? '回答正确！' : '回答错误！';
    const correctAnswer = currentQuiz.type === 'choice' ? 
        currentQuiz.answer : 
        currentQuiz.answer;

    quizContent.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="fa-solid ${resultIcon} ${isCorrect ? 'text-green-400' : 'text-red-400'} text-2xl"></i>
                <span class="text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}">${resultText}</span>
            </div>
            
            <div class="bg-slate-700 p-4 rounded-lg mb-4">
                <p class="text-slate-400 text-sm mb-2">题目：</p>
                <p class="text-white mb-4">${currentQuiz.question}</p>
                
                <p class="text-slate-400 text-sm mb-2">你的答案：</p>
                <p class="${isCorrect ? 'text-green-400' : 'text-red-400'} mb-4">${userAnswer}</p>
                
                ${!isCorrect ? `
                    <p class="text-slate-400 text-sm mb-2">正确答案：</p>
                    <p class="text-green-400 mb-4">${correctAnswer}</p>
                ` : ''}
                
                <div class="border-t border-slate-600 pt-4 mt-4">
                    <p class="text-teal-400 font-bold mb-2">📚 解析：</p>
                    <p class="text-slate-300 leading-relaxed">${currentQuiz.explanation}</p>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-sm text-slate-400">
                <span>当前得分: ${quizScore.correct}/${quizScore.total}</span>
                <span>正确率: ${Math.round(quizScore.correct / quizScore.total * 100)}%</span>
            </div>
        </div>
        
        <div class="flex gap-3">
            <button onclick="startQuiz()" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition-colors">
                下一题
            </button>
            <button onclick="resetQuiz()" class="bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                <i class="fa-solid fa-rotate-left"></i>
            </button>
        </div>
    `;
}

function resetQuiz() {
    quizScore = { correct: 0, total: 0 };
    currentQuiz = null;
    quizModal.classList.add('hidden');
}
