<template>
  <div class="app">
    <HomeScreen v-if="store.screen === 'home'" />
    <LevelSelectScreen v-else-if="store.screen === 'levels'" />
    <GameScreen v-else-if="store.screen === 'game'" />
  </div>
</template>

<script setup>
import { gameStore as store } from '@/store/gameStore.js'
import HomeScreen from '@/components/HomeScreen.vue'
import LevelSelectScreen from '@/components/LevelSelectScreen.vue'
import GameScreen from '@/components/GameScreen.vue'
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #050a14; overflow: hidden; }
.app { width: 100vw; height: 100dvh; display: flex; justify-content: center; align-items: center; }
</style>
