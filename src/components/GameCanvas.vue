<template>
  <canvas ref="canvasRef" class="game-canvas" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createEngine } from '@/game/engine.js'
import { createScene } from '@/game/scene.js'

const props = defineProps({
  levelData: { type: Object, required: true },
})
const emit = defineEmits(['win', 'unwin'])

const canvasRef = ref(null)
let engine = null
let sceneApi = null

async function initEngine() {
  if (engine) { engine.dispose(); engine = null }
  engine = await createEngine(canvasRef.value)
  sceneApi = createScene(engine, props.levelData, { onWin: () => emit('win'), onUnwin: () => emit('unwin') })
  engine.runRenderLoop(() => sceneApi.scene.render())
  window.addEventListener('resize', onResize)
}

function onResize() { engine?.resize() }

onMounted(initEngine)

watch(() => props.levelData, () => {
  sceneApi?.dispose()
  sceneApi = createScene(engine, props.levelData, { onWin: () => emit('win'), onUnwin: () => emit('unwin') })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  sceneApi?.dispose()
  engine?.dispose()
})

defineExpose({
  selectNext: () => sceneApi?.selectNext(),
  selectPrev: () => sceneApi?.selectPrev(),
  rotate: (delta) => sceneApi?.rotate(delta),
})
</script>

<style scoped>
.game-canvas { width: 100%; height: 100%; display: block; touch-action: none; }
</style>
