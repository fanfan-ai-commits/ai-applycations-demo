<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <keep-alive>
        <component :is="Component" :game-state="gameState" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup>
import { reactive, provide } from 'vue';
import 'virtual:windi.css';

// 游戏状态数据 (使用 ref/reactive 保持状态)
const gameState = reactive({
  totalMatchsticks: 60,
  playerTake: 0,
  remainingAfterPlayer: 60,
  aiTake: 0,
  currentMatchsticks: 55,
  isPlayerTurn: true
});

const resetGameState = () => {
  const initialMatchsticks = Math.floor(Math.random() * 41) + 60; // 60-100
  gameState.totalMatchsticks = initialMatchsticks;
  gameState.currentMatchsticks = initialMatchsticks;
  gameState.playerTake = 0;
  gameState.aiTake = 0;
  gameState.remainingAfterPlayer = initialMatchsticks;
  gameState.isPlayerTurn = true;
};

provide('resetGameState', resetGameState);

defineExpose({
  resetGameState
});
</script>
