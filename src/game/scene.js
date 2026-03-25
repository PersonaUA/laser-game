// SCENE

import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'

import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'


import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer'
import '@babylonjs/core/Culling/ray'
import { castLaser } from './laser.js'
import {
  createMirrorMesh, createPrismMesh, createObstacleMesh,
  createLaserSource, createTargetMesh, createBeamMeshes, highlightMesh,
} from './objects.js'
import { createWinParticles, stopParticles } from './particles.js'
import { playWin } from './sound.js'

import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture'

//import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
//import { TAARenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/taaRenderingPipeline'

//import '@babylonjs/core/Rendering/prePassRendererSceneComponent'
//import '@babylonjs/core/Rendering/geometryBufferRendererSceneComponent'
//import { SSRRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssrRenderingPipeline'

import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'

//import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'

import { MirrorTexture } from '@babylonjs/core/Materials/Textures/mirrorTexture'
import { Plane } from '@babylonjs/core/Maths/math.plane'

let floor;

export function createGrid(scene) {

  const size = 10
  const mat = new StandardMaterial('grid_mat', scene)
  mat.emissiveColor = new Color3(0.05, 0.15, 0.3)
  mat.alpha = 0.5
  for (let i = -size; i <= size; i++) {
    const h = MeshBuilder.CreateLines(`gh_${i}`, { points: [new Vector3(-size, 0, i), new Vector3(size, 0, i)] }, scene)
    h.color = new Color3(0.05, 0.18, 0.35)
    h.alpha = 0.4
    const v = MeshBuilder.CreateLines(`gv_${i}`, { points: [new Vector3(i, 0, -size), new Vector3(i, 0, size)] }, scene)
    v.color = new Color3(0.05, 0.18, 0.35)
    v.alpha = 0.4
  }
  floor = MeshBuilder.CreateGround('floor', { width: 10, height: 16 }, scene)
  
  //const fm = new StandardMaterial('floor_mat', scene)
  //fm.diffuseColor = new Color3(0.02, 0.04, 0.08)
   // fm.specularColor = new Color3(0.95, 0.95, 0.95)
  //fm.emissiveColor = new Color3(0.01, 0.02, 0.05)


  const fm = new PBRMaterial('floor_mat', scene);
  
  fm.albedoColor = new Color3(0.02, 0.04, 0.08)
  fm.metallic = 1.0
  fm.roughness = 0.02  

  const mirrorTex = new MirrorTexture('floorMirror', 1024, scene, true)
  mirrorTex.mirrorPlane = new Plane(0, -1, 0, 0)
  mirrorTex.renderList = []

  fm.reflectionTexture = mirrorTex
  fm.environmentIntensity = 0.3

  floor.material = fm
  
  // Field border
  const border = MeshBuilder.CreateLines('border', {
    points: [
      new Vector3(-4.9, 0.01, -7.9), new Vector3(4.9, 0.01, -7.9),
      new Vector3(4.9, 0.01, 7.9), new Vector3(-4.9, 0.01, 7.9),
      new Vector3(-4.9, 0.01, -7.9),
    ]
  }, scene)
  border.color = new Color3(0.1, 0.5, 0.9)
  border.alpha = 0.7

  return mirrorTex.renderList;
}

export function createScene(engine, levelData, callbacks) {
  
  const scene = new Scene(engine)

  // const pipeline = new DefaultRenderingPipeline(
  //   'default',
  //   true,
  //   scene,
  //   [scene.activeCamera]
  // )

  // pipeline.fxaaEnabled = true
  // pipeline.samples = 4

  

  
  scene.clearColor = new Color4(0.02, 0.04, 0.08, 1)

  const camera = new ArcRotateCamera('cam', Math.PI / 2, Math.PI / 3.8, 22, new Vector3(0, 0, 0), scene)
  camera.inputs.clear() // no user camera control

  // const taa = new TAARenderingPipeline("taa", scene, [camera]);
  // taa.isEnabled = true;
  // taa.samples = 8;
  // taa.factor = 0.1

  // taa.reprojectHistory = true
  // taa.clampHistory = true
  // taa.disableOnCameraMove = false

  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  light.intensity = 0.6
  light.diffuse = new Color3(0.5, 0.7, 1.0)
  light.groundColor = new Color3(0.05, 0.05, 0.1)

  // const sun = new DirectionalLight('sun', new Vector3(-1, -2.5, -1), scene);
  // sun.position  = new Vector3(15, 30, 15);
  // sun.intensity = 1.0;
  // sun.diffuse   = new Color3(1.0, 0.95, 0.82);
  // sun.specular  = new Color3(1.0, 0.95, 0.82);

  const glow = new GlowLayer("glow", scene, {
    mainTextureSamples: 4,
  });
  glow.intensity = 1.5

  glow.customEmissiveColorSelector = (mesh, _sub, mat, result) => {
    const e = mat?.emissiveColor
    if (!e) result.set(0, 0, 0, 0)
    else result.set(e.r, e.g, e.b, 1)
  }

  scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
    '/laser-game/room.env',
    scene
  )
  scene.environmentIntensity = 0.5

// const shadowGen = new ShadowGenerator(1024, sun);
// shadowGen.useBlurExponentialShadowMap = true;
// shadowGen.blurKernel = 8;  // в 3 раза легче
// shadowGen.darkness = 0.3;

  // SSR
// const ssr = new SSRRenderingPipeline('ssr', scene, [camera])
// ssr.isEnabled = true
// ssr.reflectivityThreshold = 0.9
// ssr.thickness = 0.05
// ssr.maxSteps = 64
// ssr.step = 1
// ssr.excludedMeshes.push(floor)

// AA
// const pipeline = new DefaultRenderingPipeline('default', true, scene, [camera])
// pipeline.fxaaEnabled = true
// pipeline.samples = 4
// pipeline.bloomEnabled = false
// pipeline.chromaticAberrationEnabled = false
// pipeline.depthOfFieldEnabled = false
// pipeline.grainEnabled = false

  const mirrorRenderList = createGrid(scene)
  createLaserSource(scene)
  createTargetMesh(levelData.target, scene)

  // Build object map
  const meshMap = {}
  const selectableIds = []
  
  for (const obj of levelData.objects) {
    
    let mesh = null
    
    if (obj.type === 'mirror') {
      mesh = createMirrorMesh(obj, scene)
      mirrorRenderList.push(mesh)
    }
    else if (obj.type === 'prism') {
      mesh = createPrismMesh(obj, scene)
      mirrorRenderList.push(mesh)
    }
    else if (obj.type === 'obstacle') {
      mesh = createObstacleMesh(obj, scene)
      mirrorRenderList.push(mesh)
    }
    if (mesh) {
      meshMap[obj.id] = mesh
      if (obj.type === 'mirror' || obj.type === 'prism') selectableIds.push(obj.id)
    }

    mirrorRenderList.push()
  }

  // Mutable object state (angles)
  const objState = {}
  for (const obj of levelData.objects) objState[obj.id] = { ...obj }

  let beamMeshes = []
  let winParticles = null
  let selectedIdx = 0
  let hitTargetCurrent = false

  function updateBeam() {
    beamMeshes.forEach(m => m.dispose())
    beamMeshes = []
    const { segments, hitTarget } = castLaser({ ...levelData, objects: Object.values(objState) })
    beamMeshes = createBeamMeshes(segments, scene)
    if (hitTarget && !hitTargetCurrent) {
      hitTargetCurrent = true
      playWin()
      winParticles = createWinParticles(levelData.target, scene)
      callbacks?.onWin?.()
    } else if (!hitTarget && hitTargetCurrent) {
      hitTargetCurrent = false
      stopParticles(winParticles); winParticles = null
      callbacks?.onUnwin?.()
    }
  }

  function highlightSelected() {
    for (const id of selectableIds) {
      highlightMesh(meshMap[id], id === selectableIds[selectedIdx])
    }
  }

  updateBeam()
  highlightSelected()

  // Pointer handling: drag = orbit camera (alpha only), tap = select object
  const canvas = engine.getRenderingCanvas()
  let ptrDown = false, ptrDragging = false
  let ptrStartX = 0, ptrStartY = 0, ptrLastX = 0

  function onPtrDown(e) {
    ptrDown = true; ptrDragging = false
    ptrStartX = e.clientX; ptrStartY = e.clientY; ptrLastX = e.clientX
  }
  function onPtrMove(e) {
    if (!ptrDown) return
    const dx = e.clientX - ptrLastX
    if (!ptrDragging && Math.hypot(e.clientX - ptrStartX, e.clientY - ptrStartY) > 8) ptrDragging = true
    if (ptrDragging) camera.alpha -= dx * 0.009
    ptrLastX = e.clientX
  }
  function onPtrUp() {
    if (!ptrDown) return
    if (!ptrDragging) {
      // scene.pointerX/Y обновляются Babylon.js автоматически в правильных координатах canvas
      const pick = scene.pick(scene.pointerX, scene.pointerY)
      if (pick?.hit && pick.pickedMesh?.metadata?.objId) {
        const id = pick.pickedMesh.metadata.objId
        const idx = selectableIds.indexOf(id)
        if (idx >= 0) { selectedIdx = idx; highlightSelected() }
      }
    }
    ptrDown = false; ptrDragging = false
  }
  function onPtrLeave() { ptrDown = false; ptrDragging = false }

  canvas.addEventListener('pointerdown', onPtrDown)
  canvas.addEventListener('pointermove', onPtrMove)
  canvas.addEventListener('pointerup', onPtrUp)
  canvas.addEventListener('pointerleave', onPtrLeave)

  return {
    scene,
    selectNext() {
      if (selectableIds.length === 0) return
      selectedIdx = (selectedIdx + 1) % selectableIds.length
      highlightSelected()
    },
    selectPrev() {
      if (selectableIds.length === 0) return
      selectedIdx = (selectedIdx - 1 + selectableIds.length) % selectableIds.length
      highlightSelected()
    },
    rotate(delta) {
      if (selectableIds.length === 0) return
      const id = selectableIds[selectedIdx]
      objState[id].angle += delta
      meshMap[id].rotation.y = (objState[id].angle * Math.PI) / 180
      updateBeam()
    },
    dispose() {
      canvas.removeEventListener('pointerdown', onPtrDown)
      canvas.removeEventListener('pointermove', onPtrMove)
      canvas.removeEventListener('pointerup', onPtrUp)
      canvas.removeEventListener('pointerleave', onPtrLeave)
      if (winParticles) winParticles.dispose()
      scene.dispose()
    },
  }
}
