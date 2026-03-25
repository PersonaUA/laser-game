import { Engine } from '@babylonjs/core/Engines/engine'
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine'

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Engine|WebGPUEngine>}
 */
export async function createEngine(canvas) {
  if (navigator.gpu) {
    try {
      const engine = new WebGPUEngine(canvas, {
        antialias: true,
        stencil: true,
        adaptToDeviceRatio: true,
      })
      await engine.initAsync()
      console.log('[engine] WebGPU активен')
      return engine
    } catch (e) {
      console.warn('[engine] WebGPU недоступен, fallback на WebGL:', e)
    }
  }

  const engine = new Engine(canvas, true, {
    antialias: true,
    stencil: true,
    adaptToDeviceRatio: true,
  })
  engine.setHardwareScalingLevel(1)
  console.log('[engine] WebGL активен')
  return engine
}
