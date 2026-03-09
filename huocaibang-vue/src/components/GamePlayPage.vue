<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 font-sans relative overflow-hidden">
    <!-- 背景装饰元素 -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-200/30 blur-3xl"></div>
      <div class="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-indigo-200/30 blur-3xl"></div>
      <div class="absolute top-[20%] left-[40%] w-[200px] h-[200px] rounded-full bg-purple-100/40 blur-2xl"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
      <!-- 标题栏 -->
      <header
        class="flex justify-between items-center mb-4 bg-white/60 backdrop-blur-md rounded-xl p-3 shadow-sm border border-white/50">
        <div class="flex items-center gap-3">
          <div
            class="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <RocketOutlined class="text-xl" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800 m-0">AI 智能火柴棒</h1>
            <p class="text-xs text-gray-500 m-0">取火柴棒博弈挑战</p>
          </div>
        </div>

        <!-- 倒计时高亮显示 -->
        <div class="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
          <ClockCircleOutlined class="text-orange-500" />
          <div class="text-base font-bold font-mono text-gray-800">
            {{ formatTime(countdown) }}
            <span class="text-xs font-normal text-gray-400 ml-1">倒计时</span>
          </div>
        </div>

        <!-- 规则说明按钮 -->
        <button
          class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 hover:bg-blue-50 transition-colors"
          @click="showRules = !showRules">
          <BookOutlined class="text-blue-500" />
          <span class="text-sm font-medium text-gray-700">规则说明</span>
          <component :is="showRules ? 'UpOutlined' : 'DownOutlined'" class="text-gray-400 text-xs" />
        </button>
      </header>

      <!-- 规则面板（可折叠） -->
      <transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="showRules"
          class="mb-4 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-white">
            <h3 class="font-bold text-base m-0 flex items-center gap-2">
              <BookOutlined />
              游戏规则
            </h3>
          </div>
          <div class="p-3 space-y-2">
            <div class="flex items-center gap-1 items-start group">
              <div
                class="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                1
              </div>
              <p class="text-xs text-gray-600 leading-relaxed m-0">
                系统随机生成
                <span class="font-bold text-gray-800">60-100</span> 根火柴棒。
              </p>
            </div>
            <div class="flex items-center gap-1 items-start group">
              <div
                class="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                2
              </div>
              <p class="text-xs text-gray-600 leading-relaxed m-0">
                双方轮流每次取
                <span class="font-bold text-gray-800">1-5</span> 根。
              </p>
            </div>
            <div class="flex items-center gap-1 items-start group">
              <div
                class="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-red-600 group-hover:text-white transition-colors">
                3
              </div>
              <p class="text-xs text-gray-600 leading-relaxed m-0">
                取到
                <span class="font-bold text-red-500">最后一根</span>
                火柴棒的人失败。
              </p>
            </div>
            <div class="flex items-center gap-1 items-start group">
              <div
                class="mt-0.5 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                4
              </div>
              <p class="text-xs text-gray-600 leading-relaxed m-0">
                决策限时
                <span class="font-bold text-gray-800">60秒</span>，超时随机。
              </p>
            </div>
          </div>
        </div>
      </transition>

      <!-- 游戏结束弹窗 -->
      <div v-if="gameOver"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div
          class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center transform transition-all scale-100 border border-white/50">
          <div v-if="playerWon" class="mb-6">
            <div
              class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircleOutlined class="text-6xl text-green-500" />
            </div>
            <h2
              class="text-4xl font-extrabold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
              胜利!
            </h2>
            <p class="text-gray-600 text-lg">
              你成功让 AI 落入陷阱，取走最后一根火柴棒。
            </p>
          </div>
          <div v-else class="mb-6">
            <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CloseCircleOutlined class="text-6xl text-red-500" />
            </div>
            <h2 class="text-4xl font-extrabold text-gray-900 mb-3">失败</h2>
            <p class="text-gray-600 text-lg">你取走了最后一根火柴棒。AI 胜。</p>
          </div>

          <div class="flex justify-center items-center gap-4 mt-8">
            <a-button size="large" class="flex-1 h-12 text-lg rounded-xl" @click="router.push('/')">
              返回首页
            </a-button>
          </div>
        </div>
      </div>

      <!-- 游戏主区域 -->
      <div class="grid lg:grid-cols-3 gap-4 items-start">
        <!-- 左侧大列 (2/3) -->
        <div class="lg:col-span-2 flex flex-col gap-3">
          <!-- 核心对战区 (上) -->
          <div
            class="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-xl shadow-blue-900/5 border border-white/60 relative overflow-hidden">
            <!-- 动态背景装饰 -->
            <div
              class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-16 -mt-16">
            </div>

            <div class="flex flex-col md:flex-row items-center justify-between gap-2 relative z-10">
              <!-- AI 头像/状态 -->
              <div class="text-center order-2 md:order-1">
                <div
                  class="w-20 h-20 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg mb-2 relative">
                  <RobotOutlined class="text-3xl text-white" />
                  <!-- AI 思考时的动画光圈 -->
                  <div v-if="isAiThinking"
                    class="absolute inset-0 rounded-xl border-4 border-blue-500 border-t-transparent animate-spin">
                  </div>
                </div>
                <div class="font-medium text-gray-600 text-sm">AI 对手</div>
                <div v-if="isAiThinking" class="text-xs text-blue-500 font-medium animate-pulse mt-1">
                  思考中...
                </div>
              </div>

              <!-- 火柴数量展示 -->
              <div class="text-center order-1 md:order-2 flex-1 flex flex-col items-center">
                <div
                  class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-900 drop-shadow-sm filter">
                  {{ gameState.currentMatchsticks }}
                </div>
                <div class="text-gray-400 text-xs mt-1">根</div>
              </div>

              <!-- 玩家头像/状态 -->
              <div class="text-center order-3 relative">
                <div
                  class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center shadow-inner border border-blue-100 mb-2 relative">
                  <UserOutlined class="text-3xl text-blue-600" />
                  <!-- 玩家思考/操作时的动画光圈 -->
                  <div v-if="isPlayerTurn && !isAiThinking"
                    class="absolute inset-0 rounded-xl border-4 border-blue-500 border-t-transparent animate-spin">
                  </div>
                </div>
                <div class="font-medium text-gray-600 text-sm">你</div>
              </div>
            </div>

            <!-- 回合信息提示 -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
              <div class="flex items-center gap-2 text-gray-500">
                <span class="w-2 h-2 rounded-full" :class="isPlayerTurn ? 'bg-green-500' : 'bg-gray-300'"></span>
                {{ isPlayerTurn ? "等待你操作" : "等待 AI 操作" }}
              </div>
              <div class="text-gray-400 font-mono">第 {{ rounds }} 轮</div>
            </div>
          </div>

          <!-- 操作区域 (下) -->
          <div class="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-lg shadow-blue-900/5 border border-white/60">
            <h3 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span v-if="isPlayerTurn" class="text-blue-500">
                <HighlightOutlined />
              </span>
              <span v-else class="text-gray-400">
                <SyncOutlined spin />
              </span>
              {{ isPlayerTurn ? "选择取火柴数量" : "AI 正在决策..." }}
            </h3>

            <div class="flex flex-wrap gap-2">
              <a-button v-for="n in 5" :key="n" type="primary"
                class="h-10 px-4 text-base rounded-lg !bg-white text-blue-600 border-2 border-blue-100 shadow-sm transition-all font-bold !hover:text-blue-700"
                :disabled="!isPlayerTurn || isAiThinking" @click="takeMatchsticks(n)">
                {{ n }} 根
              </a-button>
            </div>
          </div>
          <!-- 统计面板 -->
          <div class="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
            <h3 class="text-gray-800 font-bold text-sm mb-2 border-b border-gray-100 pb-2">
              本轮记录
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">你取了</span>
                <span class="font-bold text-blue-600 text-xl">{{ gameState.playerTake > 0 ? gameState.playerTake : "-"
                  }}
                  <span class="text-xs text-gray-400 font-normal">根</span></span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">AI 取了</span>
                <span class="font-bold text-red-500 text-xl">{{ gameState.aiTake > 0 ? gameState.aiTake : "-" }}
                  <span class="text-xs text-gray-400 font-normal">根</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧信息列 (1/3) -->
        <div class="grid grid-cols-1 gap-3 content-start">
          <!-- AI 思考过程 -->
          <div v-if="showThinkingPanel"
            class="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-gray-200/50 transition-all relative">
            <div class="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <BulbOutlined class="text-yellow-500" />
              AI 思考过程
            </div>
            <!-- 内容区域：限制最大高度，超出滚动 -->
            <div ref="thinkingContentRef"
              class="font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-102 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2 relative">
              <!-- 顶部渐变蒙层 - 上半部分遮盖 -->
              <div
                class="sticky top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10">
              </div>
              <span class="ai-thinking-text"></span><span
                class="inline-block w-2 h-3 bg-yellow-500 ml-1 animate-pulse align-middle"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  RocketOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  UserOutlined,
  HighlightOutlined,
  SyncOutlined,
  BookOutlined,
  BulbOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";

// 倒计时相关
const countdown = ref(60);
const totalTime = ref(60);
const isPlayerTurn = ref(true);
const isAiThinking = ref(false);
const aiThinkingProcess = ref(""); // AI 思考过程内容
const thinkingContentRef = ref(null); // DOM 引用
const showThinkingPanel = ref(false); // 控制面板显示
const showRules = ref(false); // 控制规则面板展开/收起
const gameOver = ref(false);
const playerWon = ref(false);
const rounds = ref(1);

let timer = null;

// 辅助函数：追加内容到思考过程
const appendToThinking = (text) => {
  if (!text || !thinkingContentRef.value) return;
  const escapedContent = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  thinkingContentRef.value.innerHTML += escapedContent;

  // 自动滚动到底部
  thinkingContentRef.value.scrollTop = thinkingContentRef.value.scrollHeight;
};

const router = useRouter();
const route = useRoute();

// 获取父组件引用
const resetGameStateInject = inject("resetGameState", null);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// 重置倒计时
const resetCountdown = () => {
  countdown.value = 60;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      //
      // clearInterval(timer);
      // // 超时处理：随机取1-5根
      // const randomCount = Math.floor(Math.random() * 5) + 1;
      // takeMatchsticks(randomCount);
    }
  }, 1000);
};

// 监听路由变化
watch(
  () => route.query.new,
  (newVal) => {
    if (newVal === "true") {
      router.replace({ query: { ...route.query, new: undefined } });
      resetGame(true);
    }
  }
);

// 游戏状态数据
const gameState = ref({
  totalMatchsticks: 60,
  playerTake: 0,
  aiTake: 0,
  currentMatchsticks: 60,
});

// 初始化游戏
const resetGame = (newGame = false) => {
  if (newGame) {
    const initialMatchsticks = Math.floor(Math.random() * 41) + 60;
    gameState.value = {
      totalMatchsticks: initialMatchsticks,
      playerTake: 0,
      aiTake: 0,
      currentMatchsticks: initialMatchsticks,
    };
    rounds.value = 1;
    gameOver.value = false;
    playerWon.value = false;
  }
  resetCountdown();
};

// 玩家取火柴
const takeMatchsticks = async (count) => {
  if (!isPlayerTurn.value) return;

  if (timer) clearInterval(timer);

  gameState.value.playerTake = count;
  gameState.value.currentMatchsticks -= count;
  isPlayerTurn.value = false;

  if (gameState.value.currentMatchsticks <= 0) {
    handleGameOver(false);
    return;
  }

  await aiTakeMatchsticks();
};

// AI取火柴
const aiTakeMatchsticks = async () => {
  isAiThinking.value = true;
  showThinkingPanel.value = false;
  aiThinkingProcess.value = "";
  // 清空ai上一轮选择的
  gameState.value.aiTake = "--";

  // 清空 DOM
  if (thinkingContentRef.value) {
    thinkingContentRef.value.innerHTML = "";
  }

  const currentCount = gameState.value.currentMatchsticks;
  const prompt = `你正在玩一个取火柴棒游戏。
当前火柴棒数量：${currentCount}根。
游戏规则：取到最后一根火柴棒的人失败。

请按照以下格式输出：

1. 先输出你的分析思考过程,简洁些,不要太多多余的话
2. 然后输出最终决策，必须用以下 JSON 格式：
\`\`\`json
{"action": 4}
\`\`\`

注意：
- JSON 必须用三个反引号包裹，并在第一行标注 json
- action 必须是 1-5 的数字
- JSON 必须放在分析之后，推理过程之后

例如：
当前有 60 根火柴，对方刚取了 X 根...
\`\`\`json
{"action": 4}
\`\`\``

  try {
    const response = await fetch(
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-xxx",
        },
        body: JSON.stringify({
          model: "qwen3-max",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
      }
    );

    if (!response.ok) throw new Error("Network response was not ok");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiCount = 1;
    let contentBuffer = ""; // 用于累积纯文本内容（用于最终 JSON 解析）
    let rawBuffer = ""; // 累积原始 chunk（用于调试）

    // 标志：是否已经开始显示思考过程
    let isThinkingStarted = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        rawBuffer += chunk; // 累积原始数据（用于调试）
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const dataStr = line.slice(5).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices?.[0]?.delta;

            if (!delta?.content) continue;

            const content = delta.content;
            contentBuffer += content; // 只累积纯文本内容！

            // 检查是否是分析过程（检测到 ```json 标记之前显示）
            if (!isThinkingStarted) {
              if (content.includes("```json")) {
                // 切换到 JSON 阶段，停止渲染分析内容
                isThinkingStarted = true;
              } else {
                // 显示面板并渲染分析过程内容
                showThinkingPanel.value = true;
                appendToThinking(content);
              }
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    } catch (e) {
      console.error("Stream reading error", e);
    }

    // 直接使用 contentBuffer（已经是纯文本了）
    console.log("contentBuffer:", contentBuffer);

    aiCount = 1;
    // 匹配 ```json ... ``` 包裹的内容，支持多种格式
    const jsonBlockMatch = contentBuffer.match(/```json\s*([\s\S]*?)\s*```/);
    console.log("JSON block match:", jsonBlockMatch);

    if (jsonBlockMatch) {
      try {
        const jsonStr = jsonBlockMatch[1].trim();
        console.log("Extracted JSON string:", jsonStr);
        const jsonObj = JSON.parse(jsonStr);
        if (
          typeof jsonObj.action === "number" &&
          jsonObj.action >= 1 &&
          jsonObj.action <= 5
        ) {
          aiCount = jsonObj.action;
          console.log("Extracted action from JSON object:", aiCount);
        }
      } catch (e) {
        console.error("Failed to parse JSON block:", e);
      }
    } else {
      // 方案2：如果没有 ```json 包裹，尝试直接匹配 action 字段
      const actionMatch = contentBuffer.match(/["']?action["']?\s*:\s*["']?(\d+)["']?/);
      if (actionMatch) {
        aiCount = parseInt(actionMatch[1], 10);
        console.log("Extracted action from direct match:", aiCount);
      }
    }

    aiCount = Math.max(1, Math.min(5, aiCount));
    if (aiCount > currentCount) aiCount = currentCount;

    gameState.value.aiTake = aiCount;
    gameState.value.currentMatchsticks -= aiCount;
    isAiThinking.value = false;
    rounds.value++;

    if (gameState.value.currentMatchsticks <= 0) {
      handleGameOver(true);
    } else {
      isPlayerTurn.value = true;
      resetCountdown();
    }
  } catch (error) {
    console.error("AI调用失败:", error);
    isAiThinking.value = false;

    const safeCount = Math.floor(Math.random() * 5) + 1;
    gameState.value.aiTake = safeCount;
    gameState.value.currentMatchsticks -= safeCount;

    if (gameState.value.currentMatchsticks <= 0) {
      handleGameOver(true);
    } else {
      isPlayerTurn.value = true;
      resetCountdown();
    }
  }
};

const handleGameOver = (won) => {
  if (timer) clearInterval(timer);
  gameOver.value = true;
  playerWon.value = won;
};

onMounted(() => {
  if (route.query.new !== "true") {
    resetCountdown();
  } else {
    resetGame(true);
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
