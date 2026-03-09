/**
 * 主应用 - 电磁感应AI助手
 */

let currentMode = "concept";
let currentTopic = "flux";

const topicConfig = {
    flux: { title: "磁通量 Φ", subtitle: "理解磁通量概念", mode: "concept" },
    induction: { title: "电磁感应现象", subtitle: "发现电磁感应的规律", mode: "concept" },
    faraday: { title: "法拉第电磁感应定律", subtitle: "掌握感应电动势计算", mode: "concept" },
    lenz: { title: "楞次定律", subtitle: "判断感应电流方向", mode: "concept" },
    "right-hand": { title: "右手定则", subtitle: "判断导体切割磁感线方向", mode: "concept" }
};

const teachingContent = {
    flux: {
        sections: [
            { title: "什么是磁通量", content: "磁通量是描述穿过某一面积的磁场强弱和方向的物理量。\n\n它表示磁场穿过某一平面的「总量」，既考虑磁感应强度 B，也考虑垂直穿过面积 S 的大小。", type: "text" },
            { title: "计算公式", content: "$$\\Phi = B \\cdot S \\cdot \\cos\\theta$$\n\n其中：\n- B：磁感应强度（单位：T 特斯拉）\n- S：面积（单位：m²）\n- θ：磁场方向与平面法线方向的夹角", type: "formula" },
            { title: "关键理解", content: "只有垂直穿过线圈的磁感线才算数！\n\n当 θ=0° 时，cos0°=1，磁通量最大\n当 θ=90° 时，cos90°=0，磁通量为零", type: "keypoint" }
        ],
        demo: "flux-demo"
    },
    induction: {
        sections: [
            { title: "什么是电磁感应", content: "电磁感应是指当磁体与线圈之间发生相对运动，或线圈中的电流变化时，在线圈中产生感应电动势的现象。\n\n英国科学家法拉第于1831年首次发现了这一现象。", type: "text" },
            { title: "产生感应电流的条件", content: "1. 电路必须闭合\n2. 穿过闭合电路的磁通量必须发生变化\n\n只要磁通量变化，无论用什么方式使磁通量变化，都能在闭合电路中产生感应电流。", type: "text" },
            { title: "两种产生方式", content: "① 导体运动：导体棒切割磁感线\n② 磁场变化：磁场强弱发生改变\n\n两种方式的本质都是磁通量发生了变化。", type: "keypoint" }
        ],
        demo: "induction-demo"
    },
    lenz: {
        sections: [
            { title: "楞次定律", content: "感应电流的磁场总是阻碍引起感应电流的磁通量变化。\\n\\n口诀：增反减同，来拒去留", type: "text" },
            { title: "判断步骤", content: "1. 明确原磁场的方向\\n2. 判断磁通量是增加还是减少\\n3. 根据\"增反减同\"确定感应磁场方向\\n4. 用右手螺旋定则判断感应电流方向", type: "steps" },
            { title: "理解阻碍", content: "\"阻碍\"不是\"阻止\"！\n\n磁通量增加时，感应磁场会减弱这个增加的趋势\n磁通量减少时，感应磁场会减缓这个减少的趋势", type: "keypoint" }
        ],
        demo: "lenz-demo"
    },
    faraday: {
        sections: [
            { title: "法拉第电磁感应定律", content: "电路中感应电动势的大小，跟穿过这一电路的磁通量的变化率成正比。\n\n这是电磁感应的核心定量规律。", type: "text" },
            { title: "公式表达", content: "$$\\varepsilon = -\\frac{\\Delta\\Phi}{\\Delta t}$$\n\n负号表示感应电动势的方向（与磁通量变化趋势相反）\n\n如果线圈有 N 匝：$$\\varepsilon = -N\\frac{\\Delta\\Phi}{\\Delta t}$$", type: "formula" },
            { title: "应用要点", content: "① 磁通量变化越快，感应电动势越大\n② 切割速度越快，感应电动势越大\n③ 注意是变化率，不是变化量！", type: "keypoint" }
        ],
        demo: "faraday-demo"
    },
    "right-hand": {
        sections: [
            { title: "右手定则", content: "伸开右手，使大拇指与四指垂直并在同一平面内，让磁感线穿入手心，大拇指指向导体运动方向，则四指所指的方向就是感应电流的方向。", type: "text" },
            { title: "适用场景", content: "右手定则适用于判断导体棒切割磁感线时产生的感应电流方向。\n\n注意：右手定则是楞次定律在导体切割情况下的特殊应用。", type: "text" },
            { title: "使用口诀", content: "伸右手，掌心迎磁场\n拇指指运动方向\n四指电流方向\n\n与楞次定律结合使用，效果更佳！", type: "keypoint" }
        ],
        demo: "right-hand-demo"
    }
};

const practiceProblems = {
    "basic-problems": [
        { question: "关于磁通量的说法，正确的是（）", options: ["A.磁通量越大，磁感应强度越大", "B.磁通量为零时，磁感应强度一定为零", "C.磁通量是标量，但有正负", "D.磁通量的单位是特斯拉"], answer: "C", explanation: "磁通量是标量，但有正负之分。" }
    ]
};

function initApp() {
    initUI();
    loadTopicContent("flux");
    renderMath();
}

function initUI() {
    console.log("UI初始化完成");
}

function navigateToTopic(topic) {
    currentTopic = topic;
    document.querySelectorAll(".topic-btn").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`[data-topic="${topic}"]`);
    if (btn) btn.classList.add("active");
    
    const config = topicConfig[topic];
    if (config) {
        document.getElementById("current-topic").textContent = config.title;
        document.getElementById("current-subtitle").textContent = config.subtitle;
    }
    loadTopicContent(topic);
}

function toggleMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach(b => {
        b.classList.remove("active", "bg-indigo-100");
        b.classList.add("bg-gray-100");
    });
    const btn = document.querySelector(`[data-mode="${mode}"]`);
    if (btn) {
        btn.classList.add("active");
        btn.classList.remove("bg-gray-100");
        btn.classList.add("bg-indigo-100");
    }
    loadTopicContent(currentTopic);
}

function loadTopicContent(topic) {
    const container = document.getElementById("teaching-area");
    if (!container) return;
    
    if (currentMode === "concept") {
        loadConceptContent(topic, container);
    } else {
        loadPracticeContent(topic, container);
    }
}

function loadConceptContent(topic, container) {
    const content = teachingContent[topic];
    if (!content) {
        container.innerHTML = '<div class="text-center py-12"><h3 class="text-xl">内容准备中...</h3></div>';
        return;
    }
    
    let html = '<div class="space-y-3">';
    content.sections.forEach((sec, i) => {
        html += `<div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold mb-4">#${i+1} ${sec.title}</h3>
            <div class="text-gray-600 whitespace-pre-line">${sec.content}</div>
        </div>`;
    });
    if (content.demo) {
        html += `<div class="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
            <div class="flex justify-between items-center">
                <div><h3 class="font-semibold">互动演示</h3><p class="text-sm opacity-80">通过动画加深理解</p></div>
                <button onclick="openVisualization('${content.demo}')" class="px-4 py-2 bg-white text-indigo-600 rounded-lg">开始演示</button>
            </div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    renderMath();
}

function loadPracticeContent(topic, container) {
    const problems = practiceProblems[topic] || [];
    if (problems.length === 0) {
        container.innerHTML = '<div class="text-center py-12"><h3>习题准备中...</h3></div>';
        return;
    }
    
    let html = '<div class="space-y-4"><h3 class="text-lg font-semibold">练习题目</h3>';
    problems.forEach((p, i) => {
        html += `<div class="problem-card p-4 bg-white rounded-lg border border-gray-200">
            <p class="font-medium mb-3">${i+1}. ${p.question}</p>
            <div class="space-y-2">${p.options.map((opt, j) => 
                `<div class="p-2 border rounded cursor-pointer hover:bg-indigo-50" onclick="checkAnswer(this, '${String.fromCharCode(65+j)}', '${p.answer}', '${p.explanation}')">${opt}</div>`
            ).join('')}</div>
            <div class="hidden mt-3 p-3 bg-gray-50 rounded result-box">
                <span class="result-icon"></span><span class="result-text font-medium"></span>
                <p class="text-sm mt-1 explanation"></p>
            </div>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function checkAnswer(element, selected, correct, explanation) {
    const card = element.closest(".problem-card");
    const options = card.querySelectorAll(".option-item, div.cursor-pointer");
    options.forEach(opt => {
        opt.style.pointerEvents = "none";
        if (opt.textContent.startsWith(correct)) opt.classList.add("bg-green-100", "border-green-500");
        else if (opt.textContent.startsWith(selected)) opt.classList.add("bg-red-100", "border-red-500");
    });
    const resultBox = card.querySelector(".result-box");
    resultBox.classList.remove("hidden");
    const isCorrect = selected === correct;
    resultBox.querySelector(".result-icon").textContent = isCorrect ? "✅" : "❌";
    resultBox.querySelector(".result-text").textContent = isCorrect ? "回答正确！" : "回答错误";
    resultBox.querySelector(".result-text").className = "result-text font-medium " + (isCorrect ? "text-green-600" : "text-red-600");
    resultBox.querySelector(".explanation").textContent = explanation;
}

function openVisualization(demoId) {
    const modal = document.getElementById("visualization-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalContent = document.getElementById("modal-content");

    // 根据 demoId 显示不同的演示内容
    let demoContent = '';
    let title = '';
    let canvasWidth = 600;
    let canvasHeight = 400;

    switch(demoId) {
        case 'flux-demo':
            title = "磁通量演示 - 理解磁通量概念";
            canvasWidth = 500;
            canvasHeight = 350;
            demoContent = `
                <div class="text-white mb-4 text-center">
                    <p class="text-sm opacity-80">观察磁场线穿过线圈面积的变化</p>
                </div>
                <canvas id="physics-canvas" width="${canvasWidth}" height="${canvasHeight}"></canvas>
                <div class="flex justify-center gap-3 mt-4">
                    <button onclick="physicsEngine.setFluxAngle(0)" class="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">平行</button>
                    <button onclick="physicsEngine.setFluxAngle(45)" class="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">45°</button>
                    <button onclick="physicsEngine.setFluxAngle(90)" class="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">垂直</button>
                </div>
                <div class="mt-4 p-3 bg-gray-800 text-white rounded text-sm">
                    <p>磁通量：<span id="flux-value">${(1.0).toFixed(2)}</span> Wb</p>
                    <p>线圈面积：<span id="coil-area">100</span> cm²</p>
                </div>
            `;
            break;

        case 'induction-demo':
            title = "电磁感应现象 - 产生感应电流的条件";
            demoContent = `
                <div class="text-white mb-4 text-center">
                    <p class="text-sm opacity-80">将磁铁插入或拔出线圈，观察电流表指针偏转</p>
                </div>
                <canvas id="physics-canvas" width="600" height="400"></canvas>
                <div class="flex justify-center gap-3 mt-4">
                    <button onclick="physicsEngine.moveMagnet('up')" class="px-3 py-1.5 bg-gray-700 text-white rounded text-sm">上移</button>
                    <button onclick="physicsEngine.moveMagnet('down')" class="px-3 py-1.5 bg-gray-700 text-white rounded text-sm">下移</button>
                    <button onclick="physicsEngine.moveMagnet('insert')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">插入</button>
                    <button onclick="physicsEngine.moveMagnet('extract')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">拔出</button>
                    <button onclick="physicsEngine.reset()" class="px-3 py-1.5 bg-gray-600 text-white rounded text-sm">重置</button>
                </div>
                <div class="mt-4 p-3 bg-gray-800 text-white rounded text-sm">
                    <p>磁通量：<span id="flux-value">0</span> Wb</p>
                    <p>电流：<span id="current-value">0</span> mA</p>
                </div>
            `;
            break;

        case 'lenz-demo':
            title = "楞次定律 - 判断感应电流方向";
            demoContent = `
                <div class="text-white mb-4 text-center">
                    <p class="text-sm opacity-80">观察感应电流的磁场如何阻碍磁通量变化</p>
                </div>
                <canvas id="physics-canvas" width="600" height="400"></canvas>
                <div class="flex justify-center gap-3 mt-4">
                    <button onclick="physicsEngine.lenzDemo('increase')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">增加磁通量</button>
                    <button onclick="physicsEngine.lenzDemo('decrease')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">减少磁通量</button>
                    <button onclick="physicsEngine.reset()" class="px-3 py-1.5 bg-gray-600 text-white rounded text-sm">重置</button>
                </div>
                <div class="mt-4 p-3 bg-gray-800 text-white rounded text-sm">
                    <p>原磁场方向：<span id="original-field">→</span></p>
                    <p>感应电流方向：<span id="induced-current">-</span></p>
                </div>
            `;
            break;

        case 'faraday-demo':
            title = "法拉第电磁感应定律 - 感应电动势计算";
            demoContent = `
                <div class="text-white mb-4 text-center">
                    <p class="text-sm opacity-80">速度越快，感应电动势越大</p>
                </div>
                <canvas id="physics-canvas" width="600" height="350"></canvas>
                <div class="flex justify-center gap-3 mt-4">
                    <button onclick="physicsEngine.faradayDemo('slow')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">慢速</button>
                    <button onclick="physicsEngine.faradayDemo('fast')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">快速</button>
                    <button onclick="physicsEngine.reset()" class="px-3 py-1.5 bg-gray-600 text-white rounded text-sm">重置</button>
                </div>
                <div class="mt-4 p-3 bg-gray-800 text-white rounded text-sm">
                    <p>$$\\varepsilon = -\\frac{\\Delta\\Phi}{\\Delta t}$$</p>
                    <p class="mt-2">感应电动势：<span id="emf-value">0</span> V</p>
                </div>
            `;
            break;

        case 'right-hand-demo':
            title = "右手定则 - 判断导体切割磁感线方向";
            demoContent = `
                <div class="text-white mb-4 text-center">
                    <p class="text-sm opacity-80">右手定则：掌心迎磁场，拇指指运动方向，四指指电流方向</p>
                </div>
                <canvas id="physics-canvas" width="600" height="400"></canvas>
                <div class="flex justify-center gap-3 mt-4">
                    <button onclick="physicsEngine.rightHandDemo('up')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">向上切割</button>
                    <button onclick="physicsEngine.rightHandDemo('down')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">向下切割</button>
                    <button onclick="physicsEngine.rightHandDemo('left')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">向左切割</button>
                    <button onclick="physicsEngine.reset()" class="px-3 py-1.5 bg-gray-600 text-white rounded text-sm">重置</button>
                </div>
                <div class="mt-4 p-3 bg-gray-800 text-white rounded text-sm">
                    <p class="text-center">✋ 伸开右手，让磁感线穿入手心</p>
                    <p class="mt-1">大拇指方向：<span id="thumb-dir">-</span></p>
                    <p>四指方向（电流）：<span id="fingers-dir">-</span></p>
                </div>
            `;
            break;

        default:
            title = "互动演示";
            demoContent = `
                <div class="text-white text-center py-8">
                    <p>演示即将推出...</p>
                </div>
            `;
    }

    modalTitle.textContent = title;
    modalContent.innerHTML = `<div class="demo-container">${demoContent}</div>`;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    setTimeout(() => {
        if (typeof physicsEngine !== "undefined") {
            physicsEngine.initCanvas("physics-canvas");
            physicsEngine.setDemoMode(demoId);
            physicsEngine.start();
        }
    }, 100);
}

function closeModal() {
    const modal = document.getElementById("visualization-modal");
    if (typeof physicsEngine !== "undefined") physicsEngine.stop();
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function sendMessage() {
    if (typeof conversationManager !== "undefined") conversationManager.sendMessage();
}

function askQuickQuestion(q) {
    if (typeof conversationManager !== "undefined") conversationManager.sendMessageWithText(q);
}

function renderMath() {
    if (typeof katex !== "undefined" && typeof renderMathInElement === "function") {
        document.querySelectorAll("#teaching-area").forEach(el => {
            try {
                renderMathInElement(el, { delimiters: [{left: "$$", right: "$$", display: true}], throwOnError: false });
            } catch(e) {}
        });
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    document.getElementById("toast-message").textContent = msg;
    toast.classList.remove("hidden");
    toast.classList.add("flex");
    setTimeout(() => { toast.classList.add("hidden"); toast.classList.remove("flex"); }, 2000);
}

window.navigateToTopic = navigateToTopic;
window.toggleMode = toggleMode;
window.sendMessage = sendMessage;
window.askQuickQuestion = askQuickQuestion;
window.openVisualization = openVisualization;
window.closeModal = closeModal;
window.checkAnswer = checkAnswer;

document.addEventListener("DOMContentLoaded", initApp);
