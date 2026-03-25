<template>
  <div class="home">
    <div class="glow-bg" />
    <div class="content">
      <div class="logo">
        <div class="logo-beam" />
        <h1 class="title">LASER<span class="accent">X</span></h1>
        <p class="subtitle">Reflect · Refract · Target</p>
      </div>
      <button class="btn-start" @click="onStart">START</button>
    </div>
  </div>
</template>

<script setup>
import { gameStore as store } from '@/store/gameStore.js'
import { playClick, unlockAudio } from '@/game/sound.js'

function onStart() {
  unlockAudio()
  playClick()
  store.goLevels()
}
</script>

<style scoped>
.home {
  position: relative;
  width: min(100vw, calc(100dvh * 9/16));
  height: min(100dvh, calc(100vw * 16/9));
  background: #050a14;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.glow-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,180,255,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.content { display: flex; flex-direction: column; align-items: center; gap: 3rem; z-index: 1; }
.logo { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
.logo-beam {
  width: 2px; height: 60px;
  background: linear-gradient(to bottom, transparent, #ff2200, #ff6600);
  box-shadow: 0 0 12px #ff2200, 0 0 24px #ff000066;
  margin-bottom: 0.5rem;
}
.title {
  font-family: 'Courier New', monospace;
  font-size: clamp(2.8rem, 12vw, 5rem);
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #e0f4ff;
  text-shadow: 0 0 20px rgba(0,200,255,0.5);
}
.accent { color: #00d4ff; text-shadow: 0 0 20px #00d4ff, 0 0 40px #00aaff; }
.subtitle {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.65rem, 3vw, 0.9rem);
  letter-spacing: 0.35em;
  color: #4488aa;
  text-transform: uppercase;
}
.btn-start {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.9rem, 4vw, 1.1rem);
  letter-spacing: 0.3em;
  padding: 0.9em 3em;
  background: transparent;
  color: #00d4ff;
  border: 1px solid #00d4ff;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  box-shadow: 0 0 10px rgba(0,212,255,0.2), inset 0 0 10px rgba(0,212,255,0.05);
}
.btn-start::before, .btn-start::after {
  content: ''; position: absolute;
  width: 8px; height: 8px;
  border-color: #00d4ff; border-style: solid;
}
.btn-start::before { top: -2px; left: -2px; border-width: 1px 0 0 1px; }
.btn-start::after { bottom: -2px; right: -2px; border-width: 0 1px 1px 0; }
.btn-start:hover {
  background: rgba(0,212,255,0.08);
  box-shadow: 0 0 20px rgba(0,212,255,0.4), inset 0 0 15px rgba(0,212,255,0.1);
}
</style>
