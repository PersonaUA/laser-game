import { Engine } from '@babylonjs/core/Engines/engine'

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {Engine}
 */
export function createEngine(canvas) {

  const engine = new Engine(canvas, true, {
    //preserveDrawingBuffer: true,
    antialias: true,
    stencil: true,
    adaptToDeviceRatio: true
  })

  engine.setHardwareScalingLevel(1)

  return engine
}
