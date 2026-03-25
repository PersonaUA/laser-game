import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

const C = {
  mirror: new Color3(0.4, 0.6, 0.9),
  mirrorEmit: new Color3(0.02, 0.02, 0.02),
  prism: new Color3(0.0, 0.7, 0.8),
  prismEmit: new Color3(0.0, 0.05, 0.1),
  obstacle: new Color3(0.15, 0.15, 0.25),
  obstacleEmit: new Color3(0.05, 0.05, 0.12),
  laser: new Color3(0.72, 0.78, 0.85),
  laserEmit: new Color3(0.06, 0.08, 0.11),
  target: new Color3(0.0, 1.0, 0.3),
  targetEmit: new Color3(0.0, 0.8, 0.2),
  selected: new Color3(1.0, 0.8, 0.0),
  selectedEmit: new Color3(0.11, 0.11, 0.11),

  beam: new Color3(0.3, 0.0, 0.0),
  beamEmit: new Color3(0.15, 0.0, 0.0),
}

function mat(name, diffuse, emissive, scene, alpha = 1) {
  const m = new StandardMaterial(name, scene)
  m.diffuseColor = diffuse
  m.emissiveColor = emissive
  m.alpha = alpha
  return m
}

function pbr_mat(name, scene, alpha = 1, albedoColor = new Color3(0.9, 0.9, 0.9), emissiveColor = new Color3(0.0, 0.0, 0.0)) {
  
  const m = new PBRMaterial(name, scene);
  
  m.albedoColor   = albedoColor;  // серый
  m.metallic      = 1.0;
  m.roughness     = 0.05;   // гладкость — если меньше, то максимальные отражения
  m.alpha         = alpha;  // прозрачность (0 - прозрачный, 1 - непрозрачный)
  
  m.emissiveColor = emissiveColor;
  m.backFaceCulling = false;
  m.twoSidedLighting = true;
  return m;
}

function pbr_mirror_mat(name, scene, metallic = 1, albedoColor = new Color3(0.95, 0.95, 0.95), emissiveColor = new Color3(0, 0, 0), roughness = 0.02, environmentIntensity = 1.0) {
  
  const m = new PBRMaterial(name, scene);

  m.albedoColor = albedoColor
  m.metallic = metallic
  m.roughness = roughness
  m.emissiveColor = emissiveColor; 
  // Не обязательно, но помогает сделать отражение чуть выразительнее
  m.environmentIntensity = environmentIntensity

  // Для очень гладкой поверхности
  m.microSurface = 0.98

  return m;
}



// === СОЗДАНИЕ ЗЕРКАЛ ===
export function createMirrorMesh(obj, scene) {
  const mesh = MeshBuilder.CreateBox(`mirror_${obj.id}`, { width: 2.2, height: 1.0, depth: 0.12 }, scene)
  mesh.position.set(obj.x, 0.25, obj.z)
  mesh.rotation.y = (obj.angle * Math.PI) / 180
  mesh.material = pbr_mirror_mat(`mat_mirror_${obj.id}`, scene, 0.7, C.mirror, C.mirrorEmit) //new Color3(0.05, 0.05, 0.05);
  mesh.metadata = { objId: obj.id, type: 'mirror' }

  // Невидимый хитбокс для удобного клика на тонкое зеркало
  const hit = MeshBuilder.CreateBox(`mirror_hit_${obj.id}`, { width: 2.4, height: 0.8, depth: 0.5 }, scene)
  hit.parent = mesh          // позиция в локальных координатах родителя
  hit.position = Vector3.Zero()
  hit.visibility = 0
  hit.metadata = { objId: obj.id, type: 'mirror' }

  return mesh
}
// === СОЗДАНИЕ ПРИЗМ ===
export function createPrismMesh(obj, scene) {
  const mesh = MeshBuilder.CreateBox(`prism_${obj.id}`, { width: 2.4, height: 1.0, depth: 1.2 }, scene)
  mesh.position.set(obj.x, 0.26, obj.z)
  mesh.rotation.y = (obj.angle * Math.PI) / 180
  
  // const m = mat(`mat_prism_${obj.id}`, C.prism, C.prismEmit, scene, 0.45)
  // m.backFaceCulling = false
  // mesh.material = m

  const m = pbr_mat(`mat_prism_${obj.id}`, scene, 0.7);
  mesh.material = m
  
  mesh.metadata = { objId: obj.id, type: 'prism' }
  return mesh
}
// === СОЗДАНИЕ ПРЕПЯТСТВИЙ ===
export function createObstacleMesh(obj, scene) {

  const bottom = MeshBuilder.CreateBox(`obs_cover_${obj.id}`, { width: 1.6, height: 0.1, depth: 1.6 }, scene)
  bottom.position.set(obj.x, 0.05, obj.z)

  bottom.material = pbr_mirror_mat(`mat_obs_cover_${obj.id}`, scene, 0.5, new Color3(0.0, 0.05, 0.1))
  bottom.metadata = { objId: obj.id, type: 'obstacle_cover' }
  
  const mesh = MeshBuilder.CreateBox(`obs_${obj.id}`, { width: 1.6, height: 0.4, depth: 1.6 }, scene)
  
  mesh.position.set(obj.x, 0.3, obj.z)
  
  mesh.material = mat(`mat_obs_${obj.id}`, C.beam, C.beamEmit, scene)
  mesh.metadata = { objId: obj.id, type: 'obstacle' }
  
  const cover = MeshBuilder.CreateBox(`obs_cover_${obj.id}`, { width: 1.6, height: 0.1, depth: 1.6 }, scene)
  cover.position.set(obj.x, 0.55, obj.z)

  cover.material = pbr_mirror_mat(`mat_obs_cover_${obj.id}`, scene, 0.5, new Color3(0.0, 0.05, 0.1))
  cover.metadata = { objId: obj.id, type: 'obstacle_cover' }
  
  return mesh
}

// === СОЗДАНИЕ ИСТОЧНИКА ЛАЗЕРА ===
export function createLaserSource(scene) {
  
  const base = MeshBuilder.CreateCylinder('laser_base', { height: 1.8, diameter: 0.5, tessellation: 16 }, scene)
  base.position.set(0, 0.25, 7.11)
  //base.material = mat('mat_laser_base', C.laser, C.laserEmit, scene)
  base.material = pbr_mirror_mat('mat_laser_base', scene, 0.99, new Color3(0.0, 0.0, 0.0))
  base.rotation.x = Math.PI / 2

  const top = MeshBuilder.CreateCylinder('laser_top', { height: 0.25, diameterTop: 0.2, diameterBottom: 0.4, tessellation: 8 }, scene)
  top.position.set(0, 0.25, 6.1)
  //top.material = mat('mat_laser_top', C.laser, C.laserEmit, scene)
  top.material = pbr_mirror_mat('mat_laser_base', scene, 0.99, new Color3(0.9, 0.9, 0.9))
  top.rotation.x = -Math.PI / 2

  return [base, top]
}

// === СОЗДАНИЕ МИШЕНИ ===
export function createTargetMesh(target, scene) {
  const ring1 = MeshBuilder.CreateTorus('target_r1', { diameter: 1.4, thickness: 0.08, tessellation: 32 }, scene)
  ring1.position.set(target.x, 0.05, target.z)
  ring1.rotation.x = Math.PI / 2
  ring1.material = mat('mat_tr1', C.target, C.targetEmit, scene)

  const ring2 = MeshBuilder.CreateTorus('target_r2', { diameter: 0.9, thickness: 0.07, tessellation: 32 }, scene)
  ring2.position.set(target.x, 0.05, target.z)
  ring2.rotation.x = Math.PI / 2
  ring2.material = mat('mat_tr2', C.target, C.targetEmit, scene)

  const dot = MeshBuilder.CreateCylinder('target_dot', { height: 0.05, diameter: 0.22, tessellation: 16 }, scene)
  dot.position.set(target.x, 0.05, target.z)
  dot.material = mat('mat_tdot', C.target, C.targetEmit, scene)

  return [ring1, ring2, dot]
}
// === СОЗДАНИЕ ЛАЗЕРНОГО ЛУЧА ===
export function createBeamMeshes(segments, scene) {
  const meshes = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const dx = seg.end.x - seg.start.x, dz = seg.end.z - seg.start.z
    const length = Math.sqrt(dx * dx + dz * dz)
    if (length < 0.01) continue

    const mx = (seg.start.x + seg.end.x) / 2
    const mz = (seg.start.z + seg.end.z) / 2

    function place(name, diameter) {
      const m = MeshBuilder.CreateCylinder(name, { height: length, diameter, tessellation: 4 }, scene)
      m.position.set(mx, 0.25, mz)
      m.lookAt(new Vector3(seg.end.x, 0.25, seg.end.z))
      m.rotation.x += Math.PI / 2
      return m
    }

    //const coreColor = seg.inGlass ? new Color3(0.6, 0.08, 0.2) : new Color3(1.0, 0.08, 0.0)
    const coreColor = new Color3(1.0, 0.08, 0.0)

    // Яркое ядро луча
    //const core = place(`beam_${i}_core`, seg.inGlass ? 0.025 : 0.03)
    const core = place(`beam_${i}_core`, 0.04)
    

    core.material = mat(`beam_core_mat_${i}`, Color3.Black(), coreColor, scene)
    //core.material = mat(`beam_core_mat_${i}`, C.beam, C.beamEmit, scene, 0.6)
    
    meshes.push(core)
    
  }
  return meshes
}

export function highlightMesh(mesh, selected) {
  if (!mesh?.material) return
  
  if (selected) {
     mesh.material.emissiveColor = C.selectedEmit.clone()
     mesh.material.diffuseColor = C.selected.clone()
  } else {
     const t = mesh.metadata?.type
     if (t === 'mirror') { mesh.material.diffuseColor = C.mirror; mesh.material.emissiveColor = C.mirrorEmit }
     if (t === 'prism') { mesh.material.diffuseColor = C.prism; mesh.material.emissiveColor = C.prismEmit }
  }
}
