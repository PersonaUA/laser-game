<template>
  <div class="levels">
    <div class="header">
      <button class="home-btn" @click="onHome">⌂</button>
      <h2 class="title">SELECT LEVEL</h2>
      <span class="total">{{ store.totalScore }} <span class="pts">pts</span></span>
    </div>

    <div class="grid">
      <button
        v-for="lvl in levels" :key="lvl.id"
        class="level-btn"
        :class="{
          completed: store.scores[lvl.id],
          locked: !store.isUnlocked(lvl.id),
        }"
        @click="onSelect(lvl.id)"
      >
        <span class="lock-icon" v-if="!store.isUnlocked(lvl.id)">🔒</span>
        <template v-else>
          <span class="num">{{ lvl.id }}</span>
          <span class="score" v-if="store.scores[lvl.id]">{{ store.scores[lvl.id] }} pts</span>
          <span class="score empty" v-else>—</span>
        </template>
      </button>
    </div>

    <button class="reset-btn" @click="confirmReset">RESET PROGRESS</button>

  </div>
</template>

<script setup>
import { gameStore as store } from '@/store/gameStore.js'
import { levels } from '@/game/levels.js'
import { playClick, playLocked, unlockAudio } from '@/game/sound.js'

function onHome() {
  playClick()
  store.goHome()
}

function onSelect(id) {
  unlockAudio()
  if (!store.isUnlocked(id)) {
    playLocked()
    return
  }
  playClick()
  store.startLevel(id)
}

function confirmReset() {
  playClick()
  if (confirm('Reset all progress?')) store.resetProgress()
}
</script>

<style scoped>
.levels {
  position: relative;
  width: min(100vw, calc(100dvh * 9/16));
  height: min(100dvh, calc(100vw * 16/9));
  background: #050a14;
  display: flex; flex-direction: column; align-items: center;
  padding: 0 5% 5%;
  overflow: hidden;
  caret-color: transparent;
  user-select: none;
}
.header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 5% 2% 4%;
}
.home-btn {
  background: transparent; border: 1px solid #1a4060; color: #4488aa;
  font-size: clamp(1rem, 5vw, 1.3rem); width: 2.2em; height: 2.2em;
  cursor: pointer; transition: all 0.2s;
}
.home-btn:hover { border-color: #00d4ff; color: #00d4ff; }
.title {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.75rem, 4vw, 1rem);
  letter-spacing: 0.3em; color: #4488aa;
}
.total {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.8rem, 4vw, 1rem); color: #00d4ff;
}
.pts { font-size: 0.7em; color: #4488aa; }
.grid {
  flex: 1; width: 100%;
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: clamp(6px, 2vw, 12px);
  align-content: start;
}
.level-btn {
  aspect-ratio: 1;
  background: rgba(0,50,80,0.3);
  border: 1px solid #0d3050;
  color: #e0f4ff;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.3em;
  transition: all 0.2s;
  position: relative;
}
.level-btn:hover:not(.locked) {
  border-color: #00d4ff;
  background: rgba(0,100,150,0.2);
  box-shadow: 0 0 12px rgba(0,212,255,0.15);
}
.level-btn.completed { border-color: rgba(0,212,255,0.35); }
.level-btn.locked {
  background: rgba(0,10,20,0.5);
  border-color: #0a1a28;
  cursor: not-allowed;
  opacity: 0.5;
}
.lock-icon { font-size: clamp(1.4rem, 6vw, 2rem); opacity: 0.5; }
.num {
  font-family: 'Courier New', monospace;
  font-size: clamp(1.9rem, 8vw, 2.8rem); font-weight: 700;
}
.score {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.7rem, 3.2vw, 1rem); color: #00d4ff;
}
.score.empty { color: #1a4060; }
.reset-btn {
  margin-top: 4%; padding: 0.8em 2em;
  background: transparent; border: 1px solid #3a1010; color: #664444;
  font-family: 'Courier New', monospace; font-size: clamp(0.6rem, 3vw, 0.8rem);
  letter-spacing: 0.2em; cursor: pointer; transition: all 0.2s;
}
.reset-btn:hover { border-color: #cc3333; color: #cc3333; }
</style>
