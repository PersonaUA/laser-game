<template>
  <div class="game-screen">
    <GameCanvas ref="canvasRef" :levelData="currentLevel" @win="onWin" @unwin="onUnwin" />

    <!-- HUD -->
    <div class="hud">
      <span class="hud-item">LVL {{ store.currentLevel }}</span>
      <span class="hud-score">{{ score }} <span class="star">★</span></span>
      <button class="home-btn" @click="onHome">⌂</button>
    </div>

    <!-- Controls: rotate left / right -->
    <div class="controls">
      <button class="ctrl-btn" @pointerdown="startRepeat(() => canvasRef.rotate(-5), -1)" @pointerup="stopRepeat" @pointerleave="stopRepeat">↺</button>
      <button class="ctrl-btn" @pointerdown="startRepeat(() => canvasRef.rotate(5), 1)" @pointerup="stopRepeat" @pointerleave="stopRepeat">↻</button>
    </div>

    <!-- Win: only Next button at bottom center -->
    <Transition name="win-fade">
      <div class="win-bar" v-if="won">
        <button class="btn-next" @click="onNextClick">NEXT  →</button>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { gameStore as store } from '@/store/gameStore.js'
import { levels } from '@/game/levels.js'
import GameCanvas from '@/components/GameCanvas.vue'
import { unlockAudio, playClick, playTick } from '@/game/sound.js'

const canvasRef = ref(null)
const won = ref(false)
const elapsedSec = ref(0)

let timer = null
let repeatTimer = null
let startTime = 0

const currentLevel = computed(() => levels.find(l => l.id === store.currentLevel) || levels[0])

const score = computed(() => {
  const maxScore = currentLevel.value.maxScore ?? 200
  return Math.max(10, Math.round(maxScore - elapsedSec.value * 2))
})

function startTimer() {
  startTime = Date.now()
  elapsedSec.value = 0
  timer = setInterval(() => { elapsedSec.value = (Date.now() - startTime) / 1000 }, 500)
}
function stopTimer() { clearInterval(timer); timer = null }

function onWin() {
  stopTimer()
  won.value = true
  store.saveScore(store.currentLevel, score.value)
}

function onHome() {
  playClick()
  store.goLevels()
}

function onNextClick() {
  playClick()
  won.value = false
  store.nextLevel()
}

function onUnwin() {
  won.value = false
}

function startRepeat(fn) {
  unlockAudio()
  playTick()
  fn()
  repeatTimer = setInterval(fn, 120)
}
function stopRepeat() { clearInterval(repeatTimer) }

function onKey(e) {
  if (e.key === 'ArrowUp') canvasRef.value?.selectPrev()
  else if (e.key === 'ArrowDown') canvasRef.value?.selectNext()
  else if (e.key === 'ArrowRight') canvasRef.value?.rotate(5)
  else if (e.key === 'ArrowLeft') canvasRef.value?.rotate(-5)
}

watch(() => store.currentLevel, () => { won.value = false; startTimer() })

onMounted(() => { startTimer(); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { stopTimer(); stopRepeat(); window.removeEventListener('keydown', onKey) })
</script>

<style scoped>
.game-screen {
  position: relative;
  width: min(100vw, calc(100dvh * 9/16));
  height: min(100dvh, calc(100vw * 16/9));
  background: #050a14; overflow: hidden;
}
.hud {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 3% 4% 2%;
  background: linear-gradient(to bottom, rgba(5,10,20,0.9), transparent);
  z-index: 10; pointer-events: none;
}
.hud-item {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.65rem, 3vw, 0.85rem); letter-spacing: 0.2em; color: #4488aa;
}
.hud-score {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.8rem, 3.5vw, 1rem); color: #e0f4ff; font-weight: bold;
  pointer-events: auto;
}
.home-btn {
  background: transparent; border: 1px solid #1a4060; color: #4488aa;
  font-size: clamp(0.9rem, 4vw, 1.1rem); width: 2em; height: 2em;
  cursor: pointer; pointer-events: auto; transition: all 0.2s;
}
.home-btn:hover { border-color: #00d4ff; color: #00d4ff; }
.star { color: #00d4ff; }
.controls {
  position: absolute; bottom: 5%; left: 0; right: 0;
  display: flex; justify-content: space-between; padding: 0 5%;
  z-index: 10;
}
.ctrl-btn {
  width: clamp(48px, 14vw, 64px); height: clamp(48px, 14vw, 64px);
  background: rgba(0,20,40,0.7); border: 1px solid rgba(0,180,255,0.25);
  color: #4488aa; font-size: clamp(1.8rem, 9vw, 2.6rem);
  cursor: pointer; transition: all 0.15s; user-select: none;
}
.ctrl-btn:active { background: rgba(0,100,160,0.3); border-color: #00d4ff; color: #00d4ff; }
.win-bar {
  position: absolute; bottom: calc(5% + clamp(48px,14vw,64px) + 12px);
  left: 0; right: 0; display: flex; justify-content: center;
  z-index: 15; pointer-events: auto;
}
.btn-next {
  font-family: 'Courier New', monospace; letter-spacing: 0.3em;
  padding: 0.65em 2.2em; background: rgba(5,10,20,0.85);
  border: 1px solid #00d4ff; color: #00d4ff; cursor: pointer;
  font-size: clamp(0.75rem, 3.5vw, 0.95rem);
  transition: all 0.2s;
  box-shadow: 0 0 20px rgba(0,212,255,0.2);
}
.btn-next:hover { background: rgba(0,212,255,0.12); box-shadow: 0 0 28px rgba(0,212,255,0.4); }
.win-fade-enter-active, .win-fade-leave-active { transition: opacity 0.4s; }
.win-fade-enter-from, .win-fade-leave-to { opacity: 0; }
</style>
