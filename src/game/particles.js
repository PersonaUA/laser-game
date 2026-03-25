import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color4 } from '@babylonjs/core/Maths/math.color'

export function createWinParticles(target, scene) {
  const ps = new ParticleSystem('win_particles', 300, scene)

  // Use a built-in flare texture or fallback to a blank texture
  ps.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png', scene)

  ps.emitter = new Vector3(target.x, 0.5, target.z)
  ps.minEmitBox = new Vector3(-0.2, 0, -0.2)
  ps.maxEmitBox = new Vector3(0.2, 0, 0.2)

  ps.color1 = new Color4(0.0, 1.0, 0.4, 1.0)
  ps.color2 = new Color4(0.5, 1.0, 0.2, 1.0)
  ps.colorDead = new Color4(0, 0.5, 0.2, 0.0)

  ps.minSize = 0.05
  ps.maxSize = 0.18

  ps.minLifeTime = 0.8
  ps.maxLifeTime = 2.0

  ps.emitRate = 200

  ps.blendMode = ParticleSystem.BLENDMODE_ADD

  ps.gravity = new Vector3(0, 2.5, 0)

  ps.direction1 = new Vector3(-2, 4, -2)
  ps.direction2 = new Vector3(2, 8, 2)

  ps.minAngularSpeed = 0
  ps.maxAngularSpeed = Math.PI * 2

  ps.minEmitPower = 1
  ps.maxEmitPower = 3
  ps.updateSpeed = 0.02

  ps.start()
  return ps
}

export function stopParticles(ps) {
  if (!ps) return
  ps.stop()
  setTimeout(() => ps.dispose(), 3000)
}
