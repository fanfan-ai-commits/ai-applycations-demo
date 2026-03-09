<template>
  <div class="min-h-screen bg-gray-50 font-sans flex flex-col relative overflow-hidden">
    
    <!-- 背景装饰元素 (Absolute positioned) -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-100 blur-3xl opacity-50"></div>
      <div class="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="relative z-10 bg-white/80 backdrop-blur-md shadow-sm px-6 py-3 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
          <FireOutlined class="text-sm" />
        </div>
        <span class="text-lg font-bold text-gray-800 tracking-tight">取火柴棒游戏</span>
      </div>
      
      <!-- 导航栏保留开始新游戏按钮 -->
      <a-button type="primary" size="large" class="!rounded-full px-5 shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-500 to-indigo-600 border-none hover:!bg-indigo-700 transition-all text-sm" @click="startNewGame">
        <template #icon><RocketOutlined /></template>
        开始新游戏
      </a-button>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
      
      <!-- 欢迎卡片 -->
      <div class="max-w-4xl w-full text-center mb-4">
        
        <!-- 左侧文本内容 -->
        <div class="max-w-3xl mx-auto space-y-3">
          <!-- <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
            <span class="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            AI 智能陪练模式
          </div> -->
          <h2 class="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
            策略博弈
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">与 AI 的智慧对决</span>
          </h2>
          <p class="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            在限时决策中锻炼你的策略思维、心算能力和风险评估技巧。准备好接受挑战了吗？
          </p>
          
          <div class="pt-2 flex justify-center gap-4">
            <!-- 开始游戏按钮 (白色风格) -->
            <a-button type="primary" size="large" class="!rounded-full h-10 px-6 bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400 hover:!bg-blue-50 shadow-lg shadow-blue-100 transition-all duration-300 text-sm" @click="startGame">
              <template #icon><PlayCircleOutlined /></template>
              开始游戏
            </a-button>
            
            <!-- 游戏规则按钮 (简约风格) -->
            <a-button size="large" class="!rounded-full h-10 px-6 text-gray-600 bg-transparent border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 text-sm" @click="scrollToRules">
              <template #icon><BookOutlined /></template>
              游戏规则
            </a-button>
          </div>
        </div>
      </div>

      <!-- 游戏规则区域 -->
      <div id="rules-section" class="max-w-4xl w-full mb-4 scroll-mt-20">
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div class="flex items-end mb-3">
            <div class="bg-blue-100 p-2 rounded-lg mr-3">
              <InfoCircleOutlined class="text-lg text-blue-600" />
            </div>
            <h2 class="text-lg font-bold text-gray-800">游戏规则说明</h2>
          </div>
          
          <div class="text-gray-600 leading-relaxed space-y-2 text-sm">
            <p class="flex items-start">
              <span class="text-blue-500 font-bold mr-2">1.</span>
              系统随机生成 <span class="font-bold text-gray-800">60-100</span> 之间的整数，表示火柴棒的数目。
            </p>
            <p class="flex items-start">
              <span class="text-blue-500 font-bold mr-2">2.</span>
              玩家和 AI 轮流取火柴，每次可取 <span class="font-bold text-gray-800">1, 2, 3, 4, 5</span> 根。
            </p>
            <p class="flex items-start">
              <span class="text-blue-500 font-bold mr-2">3.</span>
              <span class="font-bold text-red-500">胜负判定：</span> 取到最后一根火柴棒的人失败，另一方胜出。
            </p>
            <p class="flex items-start">
              <span class="text-blue-500 font-bold mr-2">4.</span>
              每次决策限时 <span class="font-bold text-gray-800">60秒</span>，超时将随机行动。
            </p>
          </div>
        </div>
      </div>

      <!-- 能力提升区域 -->
      <div class="max-w-6xl w-full">
        <h2 class="text-xl font-bold mb-4 text-gray-800 text-center">
          参与此游戏能提升哪些能力？
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
              <RocketOutlined class="text-lg text-purple-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">策略思维与规划</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              前瞻性思维和逻辑推理能力的全面锻炼。
            </p>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <CalculatorOutlined class="text-lg text-blue-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">快速计算与心算</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              锻炼心算速度和数字敏感度。
            </p>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
              <ThunderboltOutlined class="text-lg text-orange-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">风险评估与决策</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              在不确定的环境中评估风险收益比。
            </p>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <TeamOutlined class="text-lg text-green-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">博弈对抗能力</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              提升心理博弈能力和临场应变能力。
            </p>
          </div>
        </div>
      </div>

    </main>

    <!-- 页脚 -->
    <footer class="text-center text-gray-400 text-xs py-3 relative z-10">
      &copy; 2026 fanfan.ai出品
    </footer>

  </div>
</template>

<script setup>
import { 
  FireOutlined,
  PlayCircleOutlined,
  CalculatorOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  BookOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 开始新游戏 (重置倒计时)
const startNewGame = () => {
  router.push({ path: '/play', query: { new: 'true' } });
};

// 开始游戏 (继续之前的，不重置倒计时)
const startGame = () => {
  router.push('/play');
};

// 滚动到游戏规则
const scrollToRules = () => {
  const element = document.getElementById('rules-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
/* 可以在这里添加额外的样式 */
</style>
